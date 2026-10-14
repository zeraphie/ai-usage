import { afterEach, expect, test } from "bun:test";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { COPIED, stamped } from "../../plugin/tools/copies.js";
import { copyInto, makeProject, removeProject, runBun } from "./project.js";

let root = "";

afterEach(() => {
  removeProject(root);
});

test("copies every file and a starting config into a new project, which then passes", () => {
  root = makeProject({}, false);
  expect(copyInto(root).code).toBe(0);
  for (const name of [...COPIED, "reuse.config.ts"]) {
    expect(readFileSync(join(root, "tools", name), "utf8")).not.toBe("");
  }
  expect(runBun(join(root, "tools", "check-reuse.ts")).code).toBe(0);
});

test("never overwrites a project's own config", () => {
  const config = 'export default { sources: ["lib"], table: [] };\n';
  root = makeProject({ "tools/reuse.config.ts": config });
  copyInto(root);
  expect(readFileSync(join(root, "tools", "reuse.config.ts"), "utf8")).toBe(config);
});

test("the check passes current copies", () => {
  root = makeProject({});
  const { code, out } = copyInto(root, "--check");
  expect(code).toBe(0);
  expect(out).toContain("are current");
});

test("the check fails a copy older than the plugin's, and a missing one", () => {
  root = makeProject({});
  writeFileSync(join(root, "tools", "reuse.ts"), stamped("// an older version\n"));
  removeProject(join(root, "tools", "imports.ts"));
  const { code, out } = copyInto(root, "--check");
  expect(code).toBe(1);
  expect(out).toContain("tools/reuse.ts, tools/imports.ts differ from the plugin's");
});
