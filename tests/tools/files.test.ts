import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { filesUnder } from "../../plugin/tools/files.js";

let root: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "files-"));
  for (const path of ["src/b.ts", "src/a.ts", "src/ui/atoms/pill.tsx", "src/.hidden.ts"]) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), "");
  }
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

test("lists every file under the folder as forward-slash paths from the root, in name order", async () => {
  expect(await filesUnder(root, "src")).toEqual(["src/a.ts", "src/b.ts", "src/ui/atoms/pill.tsx"]);
});

test("keeps only the files the pattern matches", async () => {
  expect(await filesUnder(root, "src", "**/*.tsx")).toEqual(["src/ui/atoms/pill.tsx"]);
});

test("takes a nested folder, written with either slash", async () => {
  expect(await filesUnder(root, "src\\ui")).toEqual(["src/ui/atoms/pill.tsx"]);
});

test("finds nothing in a folder that does not exist", async () => {
  expect(await filesUnder(root, "server/src")).toEqual([]);
});
