import { afterEach, expect, test } from "bun:test";
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { makeProject, removeProject, runBun, type Ran } from "./project.js";

let root = "";

afterEach(() => {
  removeProject(root);
});

// A project with the reuse check copied in, the given config, and the given source files.
function project(config: string, files: Record<string, string>): string {
  root = makeProject({ ...files, "tools/reuse.config.ts": config });
  return root;
}

function run(at: string): Ran {
  return runBun(join(at, "tools", "check-reuse.ts"));
}

const CONFIG = `import type { ReuseConfig } from "./reuse.js";

export default {
  sources: ["src"],
  table: [
    {
      what: "an event dispatched by hand",
      pattern: /new CustomEvent\\(/,
      home: "src/events.ts",
      instead: "\`emit()\`",
    },
  ],
} satisfies ReuseConfig;
`;

test("passes a project that holds no copy", () => {
  const at = project(CONFIG, {
    "src/events.ts": "export const emit = () => new CustomEvent('x');\n",
    "src/menu.ts": "emit();\n",
  });
  const { code, out } = run(at);
  expect(code).toBe(0);
  expect(out).toContain("2 files hold no copy of the 1 shared pieces");
});

test("fails a project with a copy, and names it", () => {
  const at = project(CONFIG, {
    "src/events.ts": "export const emit = () => new CustomEvent('x');\n",
    "src/menu.tsx": "new CustomEvent('y');\n",
  });
  const { code, out } = run(at);
  expect(code).toBe(1);
  expect(out).toContain("src/menu.tsx:1: an event dispatched by hand");
});

test("passes a new project whose table is empty", () => {
  const at = project(
    `import type { ReuseConfig } from "./reuse.js";\n\nexport default { sources: ["src"], table: [] } satisfies ReuseConfig;\n`,
    {}
  );
  expect(run(at).code).toBe(0);
});

test("fails an import across the config's rules", () => {
  const at = project(
    `import type { ReuseConfig } from "./reuse.js";\n\nexport default {\n  sources: ["web/src", "server/src"],\n  table: [],\n  imports: [{ from: "web/src", mayNotTake: ["server/src"] }],\n} satisfies ReuseConfig;\n`,
    {
      "web/src/app.ts": 'import { routes } from "../../server/src/app.js";\n',
      "server/src/app.ts": "export const routes = {};\n",
    }
  );
  const { code, out } = run(at);
  expect(code).toBe(1);
  expect(out).toContain("web/src/app.ts:1: web/src may not take server/src");
});

test("fails a copy of the tool changed by hand", () => {
  const at = project(`export default { sources: ["src"], table: [] };\n`, {});
  appendFileSync(join(at, "tools", "reuse.ts"), "// mine\n");
  const { code, out } = run(at);
  expect(code).toBe(1);
  expect(out).toContain("tools/reuse.ts was changed by hand");
});
