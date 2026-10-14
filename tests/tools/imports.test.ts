import { expect, test } from "bun:test";
import { areaOf, importProblems, type ImportRule } from "../../plugin/tools/imports.js";
import { countsTypes } from "../../plugin/tools/reuse.js";

// setup's areas: the web app and the server never take each other's code.
const APART: ImportRule[] = [
  { from: "web/src", mayNotTake: ["server/src"] },
  { from: "server/src", mayNotTake: ["web/src"] },
];

// tablewright's UI layers: imports go down the list, never up.
const UI = "ui/src";
const LAYERS: ImportRule[] = [
  { from: `${UI}/utils`, mayTake: [`${UI}/utils`] },
  { from: `${UI}/atoms`, mayTake: [`${UI}/atoms`, `${UI}/utils`] },
  { from: `${UI}/molecules`, mayTake: [`${UI}/molecules`, `${UI}/atoms`, `${UI}/utils`] },
  {
    from: `${UI}/components`,
    mayTake: [`${UI}/molecules`, `${UI}/atoms`, `${UI}/utils`],
    ownFolder: true,
  },
];

test("a file belongs to the deepest area that holds it", () => {
  const areas = ["src", "src/ui", "src/ui/atoms"];
  expect(areaOf("src/ui/atoms/pill.ts", areas)).toBe("src/ui/atoms");
  expect(areaOf("src/main.ts", areas)).toBe("src");
  expect(areaOf("tools/build.ts", areas)).toBeUndefined();
});

test("a mayNotTake rule refuses an import into the area it names", () => {
  const texts = new Map([
    [
      "web/src/app.ts",
      'import { a } from "./a.js";\nimport { routes } from "../../server/src/app.js";\n',
    ],
  ]);
  expect(importProblems(APART, texts, false)).toEqual([
    "web/src/app.ts:2: web/src may not take server/src (server/src/app.js)",
  ]);
});

test("a mayNotTake rule lets every other import through", () => {
  const texts = new Map([
    ["web/src/app.ts", 'import "./index.css";\nexport { a } from "./a.js";\n'],
  ]);
  expect(importProblems(APART, texts, false)).toEqual([]);
});

test("a mayTake rule refuses an import that goes up a layer", () => {
  const texts = new Map([
    [
      `${UI}/atoms/pill.ts`,
      'import { emit } from "../utils/events.js";\nimport { Row } from "../molecules/row.js";\n',
    ],
  ]);
  expect(importProblems(LAYERS, texts, true)).toEqual([
    `${UI}/atoms/pill.ts:2: ${UI}/atoms may not take ${UI}/molecules (${UI}/molecules/row.js)`,
  ]);
});

test("a mayTake rule refuses what sits outside every area, such as the package's root", () => {
  const texts = new Map([[`${UI}/atoms/pill.ts`, 'import { all } from "../index.js";\n']]);
  expect(importProblems(LAYERS, texts, true)).toEqual([
    `${UI}/atoms/pill.ts:1: ${UI}/atoms may not take what sits outside every area (${UI}/index.js)`,
  ]);
});

test("a component takes from its own folder, and from no other component's", () => {
  const texts = new Map([
    [
      `${UI}/components/search/search-box.ts`,
      'import { tray } from "./tray.js";\nimport { rail } from "../rail/rail.js";\n',
    ],
  ]);
  expect(importProblems(LAYERS, texts, true)).toEqual([
    `${UI}/components/search/search-box.ts:2: ${UI}/components may not take ${UI}/components (${UI}/components/rail/rail.js)`,
  ]);
});

test("a type-only import is let through unless types are counted", () => {
  const texts = new Map([
    ["web/src/api.ts", 'import type { Health } from "../../server/src/app.js";\n'],
  ]);
  expect(importProblems(APART, texts, false)).toEqual([]);
  expect(importProblems(APART, texts, true)).toEqual([
    "web/src/api.ts:1: web/src may not take server/src (server/src/app.js)",
  ]);
});

test("a rule must name mayNotTake or mayTake, and not both", () => {
  const rules: ImportRule[] = [{ from: "src", mayNotTake: ["a"], mayTake: ["b"] }, { from: "lib" }];
  expect(importProblems(rules, new Map(), false)).toEqual([
    "the import rule for src must name mayNotTake or mayTake, and not both",
    "the import rule for lib must name mayNotTake or mayTake, and not both",
  ]);
});

test("light lets type-only imports through and robust counts them, unless set apart", () => {
  expect(countsTypes({ sources: [], table: [] })).toBe(false);
  expect(countsTypes({ mode: "light", sources: [], table: [] })).toBe(false);
  expect(countsTypes({ mode: "robust", sources: [], table: [] })).toBe(true);
  expect(countsTypes({ mode: "light", typeImports: "counted", sources: [], table: [] })).toBe(true);
  expect(countsTypes({ mode: "robust", typeImports: "let through", sources: [], table: [] })).toBe(
    false
  );
});
