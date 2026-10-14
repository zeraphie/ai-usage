import { afterEach, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { makeProject, removeProject, runBun } from "./project.js";

let root = "";

afterEach(() => {
  removeProject(root);
});

const ROBUST = 'export default { mode: "robust", sources: ["src"], table: [] };\n';

function build(...args: string[]) {
  return runBun(join(root, "tools", "build-catalogue.ts"), ...args);
}

test("a light project keeps no catalogue, and passes", () => {
  root = makeProject({});
  const { code, out } = build("--check");
  expect(code).toBe(0);
  expect(out).toContain("keeps no catalogue");
});

test("a robust project writes its catalogue, which the check then finds current", () => {
  root = makeProject({
    "tools/reuse.config.ts": ROBUST,
    "src/geometry.ts": "/** A point. */\nexport interface Point { x: number }\n",
  });
  expect(build("--check").code).toBe(1);
  expect(build().code).toBe(0);
  expect(readFileSync(join(root, ".ai", "CATALOGUE.md"), "utf8")).toContain("- `Point`: A point.");
  expect(build("--check").code).toBe(0);
});

test("a robust project fails while a shared function has no doc comment", () => {
  root = makeProject({
    "tools/reuse.config.ts": ROBUST,
    "src/geometry.ts": "export function distance(): number {\n  return 0;\n}\n",
  });
  const { code, out } = build();
  expect(code).toBe(1);
  expect(out).toContain("src/geometry.ts: distance has no doc comment");
});
