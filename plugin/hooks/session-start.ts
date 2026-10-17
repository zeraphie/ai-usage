/**
 * ─ Session start ─
 *
 * Puts the base's rules where a session reads them, as one part of
 * the session-start hook: `sync`, `workflow`, `reuse` or `project`.
 * With delivery set to `rules`, the default, `sync` copies the rules
 * into `~/.claude/rules/ai-usage/` and the project's own layers into
 * its `.claude/rules/ai-usage/`, writing only what changed, and the
 * other parts say nothing. With `context`, each other part hands its
 * rules to the session instead.
 *
 * A skill runs `sync <project> <delivery>` itself, since a command it
 * runs gets neither the project nor the plugin's options from Claude
 * Code; the hook passes neither and reads them from its environment.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import {
  ALWAYS,
  changes,
  contextOf,
  onDemandNote,
  placed,
  projectRules,
  userRules,
  type ProjectBase,
} from "./delivery.js";

const RULES = join(import.meta.dir, "..", "rules");
const STACKS = join(RULES, "stacks");
const part = process.argv[2] ?? "sync";
const delivery =
  (process.argv[4] ?? process.env["CLAUDE_PLUGIN_OPTION_DELIVERY"]) === "context"
    ? "context"
    : "rules";
const project = process.argv[3] ?? process.env["CLAUDE_PROJECT_DIR"] ?? process.cwd();
const userDir = join(homedir(), ".claude", "rules", "ai-usage");
const projectDir = join(project, ".claude", "rules", "ai-usage");

const problems: string[] = [];
const read = (name: string): string => readFileSync(join(RULES, name), "utf8");

if (part === "sync") {
  if (delivery === "rules") {
    apply(userDir, userRules(read, RULES));
    const own = ownRules();
    if (own !== undefined) {
      apply(projectDir, own);
    }
  } else {
    // Handing the rules to the session: copies left from the other way would load twice.
    rmSync(userDir, { recursive: true, force: true });
    rmSync(projectDir, { recursive: true, force: true });
  }
} else if (delivery === "context") {
  if (ALWAYS.includes(`${part}.md`)) {
    console.log(contextOf(placed(read(`${part}.md`), RULES)));
  } else if (part === "project") {
    const own = ownRules();
    const texts = own === undefined ? [] : [...own.values()];
    console.log(contextOf([...texts, onDemandNote(RULES)].join("\n")));
  }
}

if (problems.length > 0) {
  console.log(JSON.stringify({ systemMessage: `ai-usage: ${problems.join("; ")}` }));
}

// The project's own layers and note, from its `.ai/base.json`; none for a
// project that has none, which is not on the base.
function ownRules(): Map<string, string> | undefined {
  const path = join(project, ".ai", "base.json");
  if (!existsSync(path)) {
    return undefined;
  }
  let base: ProjectBase;
  try {
    base = JSON.parse(readFileSync(path, "utf8")) as ProjectBase;
  } catch (error) {
    problems.push(`.ai/base.json does not parse: ${String(error)}`);
    return undefined;
  }
  const stacks = new Map(
    readdirSync(STACKS)
      .filter((name) => name.endsWith(".md"))
      .map((name) => [basename(name, ".md"), readFileSync(join(STACKS, name), "utf8")] as const)
  );
  const own = projectRules(base, stacks);
  problems.push(...own.problems);
  return own.rules;
}

// Makes `dir` hold exactly `want`, touching only the files that differ.
function apply(dir: string, want: ReadonlyMap<string, string>): void {
  mkdirSync(dir, { recursive: true });
  const have = new Map(
    readdirSync(dir)
      .filter((name) => name.endsWith(".md"))
      .map((name) => [name, readFileSync(join(dir, name), "utf8")] as const)
  );
  const { write, remove } = changes(want, have);
  for (const [name, text] of write) {
    writeFileSync(join(dir, name), text);
  }
  for (const name of remove) {
    rmSync(join(dir, name));
  }
}
