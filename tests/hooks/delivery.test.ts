import { expect, test } from "bun:test";
import {
  changes,
  contextOf,
  onDemandNote,
  placed,
  projectRules,
  userRules,
} from "../../plugin/hooks/delivery.js";

const STACKS = new Map([
  ["react", "# React\n"],
  ["lit", "# Lit\n"],
]);

test("points {{rules}} at the plugin's rules folder, with forward slashes", () => {
  expect(placed("read `{{rules}}/security.md`", "C:\\plugin\\rules")).toBe(
    "read `C:/plugin/rules/security.md`"
  );
});

test("every session gets the always-on rules and those that load with files, not security", () => {
  const rules = userRules((name) => `# ${name} {{rules}}\n`, "/p/rules");
  expect([...rules.keys()]).toEqual([
    "workflow.md",
    "reuse.md",
    "reuse-tools.md",
    "style.md",
    "testing.md",
  ]);
  expect(rules.get("workflow.md")).toBe("# workflow.md /p/rules\n");
});

test("a project gets the layers it names, and a note of its options", () => {
  const { rules, problems } = projectRules({ stacks: ["react"], options: ["stories"] }, STACKS);
  expect(problems).toEqual([]);
  expect([...rules.keys()]).toEqual(["react.md", "project.md"]);
  expect(rules.get("project.md")).toContain("- Stack layers: react.");
  expect(rules.get("project.md")).toContain("- Options: stories.");
});

test("a project that names nothing gets only its note", () => {
  const { rules } = projectRules({}, STACKS);
  expect([...rules.keys()]).toEqual(["project.md"]);
  expect(rules.get("project.md")).toContain("- Stack layers: none.");
});

test("an unknown stack or option is a problem, and is left out", () => {
  const { rules, problems } = projectRules({ stacks: ["vue"], options: ["dark"] }, STACKS);
  expect(problems).toEqual([
    '.ai/base.json names the stack "vue", which the base has no layer for',
    '.ai/base.json names the option "dark"; the options are stories, fintech, look',
  ]);
  expect(rules.get("project.md")).toContain("- Options: none.");
});

test("writes only what is new or changed, and removes what is no longer wanted", () => {
  const want = new Map([
    ["a.md", "same"],
    ["b.md", "new"],
  ]);
  const have = new Map([
    ["a.md", "same"],
    ["b.md", "old"],
    ["c.md", "gone"],
  ]);
  expect(changes(want, have)).toEqual({ write: [["b.md", "new"]], remove: ["c.md"] });
});

test("hands a rules file to the session as SessionStart context", () => {
  expect(JSON.parse(contextOf("# Rules"))).toEqual({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "# Rules" },
  });
});

test("the stand-in note names where the scoped rules are", () => {
  expect(onDemandNote("C:\\p\\rules")).toContain("`C:/p/rules/style.md`");
});
