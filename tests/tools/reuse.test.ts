import { expect, test } from "bun:test";
import { lineOf, tableProblems, type Row } from "../../plugin/tools/reuse.js";

const EMIT: Row = {
  what: "an event dispatched by hand",
  pattern: /new CustomEvent\(/,
  home: "src/utils/events.ts",
  instead: "`emit()`",
};

const HOME = "export function emit() { return new CustomEvent(name); }\n";

test("an empty table finds nothing", () => {
  expect(tableProblems([], new Map([["src/a.ts", "new CustomEvent("]]))).toEqual([]);
});

test("passes when only the home writes the pattern", () => {
  const texts = new Map([
    ["src/utils/events.ts", HOME],
    ["src/menu.ts", "emit();\n"],
  ]);
  expect(tableProblems([EMIT], texts)).toEqual([]);
});

test("refuses a copy outside the home, naming its line and what to use", () => {
  const texts = new Map([
    ["src/utils/events.ts", HOME],
    ["src/menu.ts", "const a = 1;\nhost.dispatchEvent(new CustomEvent(name));\n"],
  ]);
  expect(tableProblems([EMIT], texts)).toEqual([
    "src/menu.ts:2: an event dispatched by hand; use `emit()` from src/utils/events.ts",
  ]);
});

test("refuses a row whose home no longer writes the pattern", () => {
  const texts = new Map([["src/utils/events.ts", "export function emit() {}\n"]]);
  expect(tableProblems([EMIT], texts)).toEqual([
    "src/utils/events.ts: named in the row for an event dispatched by hand, and does not write it",
  ]);
});

test("refuses a row whose home is not among the files read", () => {
  expect(tableProblems([EMIT], new Map())).toEqual([
    "src/utils/events.ts: named in the row for an event dispatched by hand, and does not write it",
  ]);
});

test("lets an excused file write the pattern", () => {
  const row = { ...EMIT, excused: { "src/page.ts": "the page has no Lit to reach" } };
  const texts = new Map([
    ["src/utils/events.ts", HOME],
    ["src/page.ts", "new CustomEvent(name);\n"],
  ]);
  expect(tableProblems([row], texts)).toEqual([]);
});

test("refuses an excuse that nothing needs any more", () => {
  const row = { ...EMIT, excused: { "src/page.ts": "the page has no Lit to reach" } };
  const texts = new Map([
    ["src/utils/events.ts", HOME],
    ["src/page.ts", "emit();\n"],
  ]);
  expect(tableProblems([row], texts)).toEqual([
    "src/page.ts: named in the row for an event dispatched by hand, and does not write it",
  ]);
});

test("a row held within a folder looks nowhere else", () => {
  const row = { ...EMIT, within: ["src/board"] };
  const texts = new Map([
    ["src/utils/events.ts", HOME],
    ["src/app/main.ts", "new CustomEvent(name);\n"],
    ["src/board/tool.ts", "new CustomEvent(name);\n"],
  ]);
  expect(tableProblems([row], texts)).toEqual([
    "src/board/tool.ts:1: an event dispatched by hand; use `emit()` from src/utils/events.ts",
  ]);
});

test("counts lines from one", () => {
  expect(lineOf("a\nb\nc", 0)).toBe(1);
  expect(lineOf("a\nb\nc", 4)).toBe(3);
});
