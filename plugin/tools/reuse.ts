/**
 * ─ The reuse check's rules ─
 *
 * What a project's table says, and what refuses a copy of it. A row
 * names a shared piece by what a copy of it looks like, the one file
 * that writes it, and what to use instead. A copy anywhere else is
 * refused, and so is a row whose named files no longer write the
 * pattern, so the table stays true. Pure: it reads text, not disk.
 */

import type { CatalogueConfig } from "./catalogue.js";
import type { ImportRule } from "./imports.js";

/** One shared piece in a project's table. */
export interface Row {
  /** What a copy is, as a refusal says it. */
  readonly what: string;
  /** What a copy looks like in the source. */
  readonly pattern: RegExp;
  /** The one file that writes it, from the project's root. */
  readonly home: string;
  /** What to use instead. */
  readonly instead: string;
  /** The folders the row holds for; every file read when it names none. */
  readonly within?: readonly string[];
  /** Files with a reason of their own to write it, each with the reason. */
  readonly excused?: Readonly<Record<string, string>>;
}

/**
 * How thorough a project's reuse is. Light suits a short or early project: type-only imports cross
 * any rule. Robust suits a long one: they count.
 */
export type ReuseMode = "light" | "robust";

/** What a project tells the reuse check, in `tools/reuse.config.ts`. */
export interface ReuseConfig {
  /** Light or robust; light when it is left out. Each part below may still be set apart. */
  readonly mode?: ReuseMode;
  /** Whether a type-only import counts against the import rules. Follows the mode when left out. */
  readonly typeImports?: "counted" | "let through";
  /** Which areas may take code from which. */
  readonly imports?: readonly ImportRule[];
  /** The catalogue: on in robust and off in light. `false` turns it off, settings turn it on. */
  readonly catalogue?: false | CatalogueConfig;
  /** The folders of hand-written source, from the project's root. Tests and generated files are no one's copy. */
  readonly sources: readonly string[];
  /** Which files under the sources are read. Defaults to TypeScript. */
  readonly pattern?: string;
  /** Single files outside the sources that are read too, such as a page's own stylesheet. */
  readonly files?: readonly string[];
  /** The shared pieces. Empty until the first is shared; each row arrives with the piece it guards. */
  readonly table: readonly Row[];
}

/** Whether a type-only import counts, from the config's own setting or else its mode. */
export function countsTypes(config: ReuseConfig): boolean {
  return config.typeImports === undefined
    ? config.mode === "robust"
    : config.typeImports === "counted";
}

/** How the catalogue is made, or `undefined` when the project has none. */
export function catalogueSettings(config: ReuseConfig): CatalogueConfig | undefined {
  if (config.catalogue === false) {
    return undefined;
  }
  return config.catalogue ?? (config.mode === "robust" ? {} : undefined);
}

/** The files a check reads when the config names no pattern. */
export const DEFAULT_PATTERN = "**/*.{ts,tsx}";

/** The line `at` falls on in `text`, counted from 1. */
export function lineOf(text: string, at: number): number {
  return text.slice(0, at).split("\n").length;
}

/**
 * Every problem the table finds in `texts`, a map of path to file text: a copy outside its home,
 * and a home or excused file that no longer writes its pattern.
 */
export function tableProblems(table: readonly Row[], texts: ReadonlyMap<string, string>): string[] {
  const problems: string[] = [];
  for (const row of table) {
    const excused = row.excused ?? {};
    // A row is only as good as the places it names: a home that no longer
    // writes the pattern guards nothing, and an excuse nothing needs is a hole.
    for (const named of [row.home, ...Object.keys(excused)]) {
      const text = texts.get(named);
      if (text === undefined || !row.pattern.test(text)) {
        problems.push(`${named}: named in the row for ${row.what}, and does not write it`);
      }
    }
    for (const [path, text] of texts) {
      const isHeld =
        row.within === undefined || row.within.some((folder) => path.startsWith(`${folder}/`));
      if (!isHeld || path === row.home || path in excused) {
        continue;
      }
      const found = row.pattern.exec(text);
      if (found !== null) {
        problems.push(
          `${path}:${lineOf(text, found.index)}: ${row.what}; use ${row.instead} from ${row.home}`
        );
      }
    }
  }
  return problems;
}
