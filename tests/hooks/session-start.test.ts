import { afterEach, expect, test } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const HOOK = join(import.meta.dir, "..", "..", "plugin", "hooks", "session-start.ts");

let root = "";

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

// A home and a project in a temporary folder, the project with `base` as its .ai/base.json.
function setUp(base?: string): { home: string; project: string } {
  root = mkdtempSync(join(tmpdir(), "session-start-"));
  const home = join(root, "home");
  const project = join(root, "project");
  mkdirSync(home);
  mkdirSync(join(project, ".ai"), { recursive: true });
  if (base !== undefined) {
    writeFileSync(join(project, ".ai", "base.json"), base);
  }
  return { home, project };
}

function hook(
  at: { home: string; project: string },
  part: string,
  delivery?: string,
  args: string[] = []
) {
  const env: Record<string, string> = {
    ...process.env,
    HOME: at.home,
    USERPROFILE: at.home,
    CLAUDE_PROJECT_DIR: at.project,
  };
  if (delivery !== undefined) {
    env["CLAUDE_PLUGIN_OPTION_DELIVERY"] = delivery;
  }
  const result = Bun.spawnSync([process.execPath, HOOK, part, ...args], { env });
  return { code: result.exitCode, out: result.stdout.toString() };
}

const userDir = (home: string): string => join(home, ".claude", "rules", "ai-usage");
const projectDir = (project: string): string => join(project, ".claude", "rules", "ai-usage");

test("sync copies the base into the user's rules and the project's layers into its own", () => {
  const at = setUp('{ "stacks": ["react"], "options": ["look"] }');
  const { code, out } = hook(at, "sync");
  expect(code).toBe(0);
  expect(out).toBe("");
  expect(readdirSync(userDir(at.home)).sort()).toEqual([
    "reuse-tools.md",
    "reuse.md",
    "style.md",
    "testing.md",
    "workflow.md",
  ]);
  expect(readdirSync(projectDir(at.project)).sort()).toEqual(["project.md", "react.md"]);
  expect(readFileSync(join(userDir(at.home), "workflow.md"), "utf8")).not.toContain("{{rules}}");
});

test("a project with no base.json gets nothing of its own", () => {
  const at = setUp();
  hook(at, "sync");
  expect(existsSync(userDir(at.home))).toBe(true);
  expect(existsSync(projectDir(at.project))).toBe(false);
});

test("a layer the project stops naming is removed", () => {
  const at = setUp('{ "stacks": ["react", "lit"] }');
  hook(at, "sync");
  writeFileSync(join(at.project, ".ai", "base.json"), '{ "stacks": ["lit"] }');
  hook(at, "sync");
  expect(readdirSync(projectDir(at.project)).sort()).toEqual(["lit.md", "project.md"]);
});

test("a stack the base does not know is said, not silently dropped", () => {
  const at = setUp('{ "stacks": ["vue"] }');
  const { out } = hook(at, "sync");
  expect(JSON.parse(out).systemMessage).toContain('names the stack "vue"');
});

test("with rules delivery, the context parts say nothing", () => {
  const at = setUp("{}");
  expect(hook(at, "workflow").out).toBe("");
  expect(hook(at, "project").out).toBe("");
});

test("with context delivery, each part hands its rules to the session, and sync clears the copies", () => {
  const at = setUp('{ "stacks": ["react"] }');
  hook(at, "sync");
  hook(at, "sync", "context");
  expect(existsSync(userDir(at.home))).toBe(false);
  expect(existsSync(projectDir(at.project))).toBe(false);
  const workflow = JSON.parse(hook(at, "workflow", "context").out);
  expect(workflow.hookSpecificOutput.additionalContext).toContain("# Workflow");
  const project = JSON.parse(hook(at, "project", "context").out);
  expect(project.hookSpecificOutput.additionalContext).toContain("# React");
  expect(project.hookSpecificOutput.additionalContext).toContain("style.md");
});

test("sync takes the project and the delivery as arguments, as a skill runs it", () => {
  const at = setUp('{ "stacks": ["lit"] }');
  const elsewhere = { home: at.home, project: join(root, "elsewhere") };
  mkdirSync(elsewhere.project);
  hook(elsewhere, "sync", undefined, [at.project, "rules"]);
  expect(readdirSync(projectDir(at.project)).sort()).toEqual(["lit.md", "project.md"]);
  expect(existsSync(projectDir(elsewhere.project))).toBe(false);
  hook(elsewhere, "sync", undefined, [at.project, "context"]);
  expect(existsSync(projectDir(at.project))).toBe(false);
});
