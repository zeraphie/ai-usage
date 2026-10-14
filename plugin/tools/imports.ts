/**
 * ─ Import rules ─
 *
 * Which folders of a project may take code from which. A rule is
 * written for one area, a folder from the root, either as what it may
 * not take or as all it may take. A file belongs to the deepest area
 * that holds it. Pure: it reads text, not disk.
 */

import { posix } from "node:path";
import { lineOf } from "./reuse.js";

/** What one area of the project may take from the others. Name `mayNotTake` or `mayTake`, not both. */
export interface ImportRule {
  /** The area the rule is for: a folder from the project's root. */
  readonly from: string;
  /** Areas a file here may not take from. Anything else it may. */
  readonly mayNotTake?: readonly string[];
  /** The only areas a file here may take from. Anything else, the root included, it may not. */
  readonly mayTake?: readonly string[];
  /** A file may also take from its own subfolder of `from`, as a component takes from its own folder. */
  readonly ownFolder?: boolean;
}

// Every relative import that brings code with it, and every one at all.
const CODE_IMPORT =
  /^(?:import|export)\s(?!type\s)[^;]*?from\s+"(\.[^"]+)"|^import\s+"(\.[^"]+)"/gm;
const ANY_IMPORT = /^(?:import|export)\s[^;]*?from\s+"(\.[^"]+)"|^import\s+"(\.[^"]+)"/gm;

/** The deepest of `areas` that holds `path`, or `undefined` when none does. */
export function areaOf(path: string, areas: readonly string[]): string | undefined {
  let deepest: string | undefined;
  for (const area of areas) {
    if (path.startsWith(`${area}/`) && (deepest === undefined || area.length > deepest.length)) {
      deepest = area;
    }
  }
  return deepest;
}

/**
 * Every import in `texts`, a map of path to file text, that breaks a rule, and every rule that is
 * written wrong. A type-only import counts only when `countTypes` is set.
 */
export function importProblems(
  rules: readonly ImportRule[],
  texts: ReadonlyMap<string, string>,
  countTypes: boolean
): string[] {
  const problems: string[] = [];
  for (const rule of rules) {
    if ((rule.mayNotTake === undefined) === (rule.mayTake === undefined)) {
      problems.push(
        `the import rule for ${rule.from} must name mayNotTake or mayTake, and not both`
      );
    }
  }
  const byArea = new Map(rules.map((rule) => [rule.from, rule]));
  const areas = [
    ...new Set(
      rules.flatMap((rule) => [rule.from, ...(rule.mayNotTake ?? []), ...(rule.mayTake ?? [])])
    ),
  ];
  const pattern = countTypes ? ANY_IMPORT : CODE_IMPORT;
  for (const [path, text] of texts) {
    const from = areaOf(path, areas);
    const rule = from === undefined ? undefined : byArea.get(from);
    if (rule === undefined || from === undefined) {
      continue;
    }
    for (const found of text.matchAll(pattern)) {
      const target = posix.join(posix.dirname(path), found[1] ?? found[2] ?? "");
      const to = areaOf(target, areas);
      if (!isAllowed(rule, from, path, target, to)) {
        problems.push(
          `${path}:${lineOf(text, found.index)}: ${from} may not take ` +
            `${to ?? "what sits outside every area"} (${target})`
        );
      }
    }
  }
  return problems;
}

function isAllowed(
  rule: ImportRule,
  from: string,
  path: string,
  target: string,
  to: string | undefined
): boolean {
  const own = ownFolderOf(path, from);
  if (rule.ownFolder === true && to === from && own !== "" && own === ownFolderOf(target, from)) {
    return true;
  }
  if (rule.mayTake !== undefined) {
    return to !== undefined && rule.mayTake.includes(to);
  }
  return to === undefined || !(rule.mayNotTake ?? []).includes(to);
}

// The first folder under `area` that holds `path`; nothing for a file at the area's own level.
function ownFolderOf(path: string, area: string): string {
  const [first = "", ...rest] = posix.relative(area, path).split("/");
  return rest.length > 0 ? first : "";
}
