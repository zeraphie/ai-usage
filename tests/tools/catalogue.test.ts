import { expect, test } from "bun:test";
import { catalogueOf, openingOf } from "../../plugin/tools/catalogue.js";
import { catalogueSettings } from "../../plugin/tools/reuse.js";

const SOURCES = ["src"];

function catalogue(files: Record<string, string>, offered: string[] = [], glue: string[] = []) {
  return catalogueOf(
    new Map(Object.entries(files)),
    SOURCES,
    { offered, glue },
    "bun run catalogue"
  );
}

const CAMERA = `/** Where the view is. */
export interface View { x: number }

/** The view moved by \`by\`. */
export function moved(view: View, by: number): View {
  return { x: view.x + by };
}

/** Kept to the camera. */
export function clamp(x: number): number {
  return x;
}
`;

test("lists a name another folder takes, with the folder that takes it", () => {
  const { text, missing } = catalogue({
    "src/camera/view.ts": CAMERA,
    "src/canvas/stage.ts": 'import { moved, type View } from "../camera/view.js";\n',
  });
  expect(missing).toEqual([]);
  expect(text).toContain("## src/camera\n\n**src/camera/view.ts** (src/canvas)");
  expect(text).toContain("- `View`: Where the view is.");
  expect(text).toContain("- `moved()`: The view moved by `by`.");
  expect(text).not.toContain("clamp");
});

test("leaves out a name only its own folder takes", () => {
  const { text } = catalogue({
    "src/camera/view.ts": CAMERA,
    "src/camera/input.ts": 'import { clamp } from "./view.js";\n',
  });
  expect(text).not.toContain("view.ts");
});

test("lists every name at the root and in an offered folder, but not the glue", () => {
  const { text } = catalogue(
    {
      "src/geometry.ts": "/** A point. */\nexport interface Point { x: number }\n",
      "src/main.ts": "/** Starts the app. */\nexport function start(): void {}\n",
      "src/ui/atoms/pill.ts": "/** A rounded control. */\nexport function Pill(): void {}\n",
    },
    ["src/ui/atoms"],
    ["src/main.ts"]
  );
  expect(text).toContain("## src\n\n**src/geometry.ts**\n- `Point`: A point.");
  expect(text).toContain(
    "## src/ui/atoms\n\n**src/ui/atoms/pill.ts**\n- `Pill()`: A rounded control."
  );
  expect(text).not.toContain("main.ts");
});

test("reports a listed function or class with no doc comment, and lists a bare constant by name", () => {
  const { text, missing } = catalogue({
    "src/rules.ts":
      "export const LIMIT = 3;\nexport function bare(): void {}\nexport class Box {}\n",
  });
  expect(missing).toEqual([
    "src/rules.ts: bare has no doc comment",
    "src/rules.ts: Box has no doc comment",
  ]);
  expect(text).toContain("- Also: `LIMIT`, `bare()`, `Box`");
});

test("does not take a file's titled preamble for its first name's doc comment", () => {
  const { missing } = catalogue({
    "src/first.ts":
      "/**\n * ─ First ─\n *\n * What the file is for.\n */\nexport function first(): void {}\n",
  });
  expect(missing).toEqual(["src/first.ts: first has no doc comment"]);
});

test("opens on the first full stop outside code", () => {
  expect(openingOf("Calls `a.b()` once. Then more.")).toBe("Calls `a.b()` once.");
  expect(openingOf("No stop here\n\nA second paragraph.")).toBe("No stop here");
});

test("the catalogue is on in robust and off in light, unless set apart", () => {
  expect(catalogueSettings({ sources: [], table: [] })).toBeUndefined();
  expect(catalogueSettings({ mode: "robust", sources: [], table: [] })).toEqual({});
  expect(
    catalogueSettings({ mode: "robust", catalogue: false, sources: [], table: [] })
  ).toBeUndefined();
  expect(catalogueSettings({ catalogue: { offered: ["src/ui"] }, sources: [], table: [] })).toEqual(
    {
      offered: ["src/ui"],
    }
  );
});
