/**
 * ─ The catalogue's rules ─
 *
 * What a project shares, as a list a session reads before it writes:
 * each shared name with the sentence its doc comment opens on, by
 * folder, then file. A name is shared when a file in another folder
 * takes it, or when its folder exists to be taken. A listed function
 * or class with no doc comment is reported, so the sentence gets
 * written. Pure: it reads text, not disk.
 */

import { posix } from "node:path";

/** How a project's catalogue is made, in `tools/reuse.config.ts`. */
export interface CatalogueConfig {
  /** Folders whose every name is listed, whoever takes it, since they exist to be taken. */
  readonly offered?: readonly string[];
  /** Files that take everything and that nothing takes, such as the entry; never listed whole. */
  readonly glue?: readonly string[];
  /** Where the catalogue is written, from the project's root. Defaults to `.ai/CATALOGUE.md`. */
  readonly out?: string;
}

/** Where a catalogue is written when the config names nowhere. */
export const DEFAULT_OUT = ".ai/CATALOGUE.md";

type Kind = "function" | "class" | "value" | "type";

interface Named {
  readonly name: string;
  readonly kind: Kind;
  /** The opening sentence of its doc comment, or none. */
  readonly said: string | undefined;
}

interface Listed {
  readonly path: string;
  readonly group: string;
  readonly names: readonly Named[];
  /** The folders that take from this file. */
  readonly takers: readonly string[];
}

/** The catalogue's text, and every listed function or class with no doc comment. */
export interface Catalogue {
  readonly text: string;
  readonly missing: readonly string[];
}

const EXPORT =
  /^export (?:declare )?(?:async )?(function\*?|const|let|class|abstract class|enum|interface|type) (\w+)/gm;
const IMPORT = /^import\s+([\s\S]*?)\s+from\s+"(\.[^"]+)";/gm;

function kindOf(keyword: string): Kind {
  if (keyword.startsWith("function")) {
    return "function";
  }
  if (keyword.endsWith("class")) {
    return "class";
  }
  return keyword === "interface" || keyword === "type" ? "type" : "value";
}

// The doc comment that ends right above `at`, as prose without its tags;
// none when there is none, or when it is a file's titled preamble.
function docAbove(text: string, at: number): string | undefined {
  const before = text.slice(0, at).trimEnd();
  if (!before.endsWith("*/")) {
    return undefined;
  }
  const start = before.lastIndexOf("/**");
  const block = start < 0 ? "" : before.slice(start + 3, -2);
  if (start < 0 || block.includes("─")) {
    return undefined;
  }
  return block
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .join("\n")
    .split(/\n\s*@/)[0]!
    .trim();
}

/** A doc comment's opening sentence: up to the first full stop outside code, or its first paragraph. */
export function openingOf(prose: string): string {
  const paragraph = (prose.split(/\n\s*\n/)[0] ?? "").replace(/\s+/g, " ").trim();
  let inCode = false;
  for (let at = 0; at < paragraph.length; at += 1) {
    const letter = paragraph[at];
    if (letter === "`") {
      inCode = !inCode;
    } else if (letter === "." && !inCode && (paragraph[at + 1] ?? " ") === " ") {
      return paragraph.slice(0, at + 1);
    }
  }
  return paragraph;
}

// One entry per name: an overloaded function is listed once, by its first signature.
function exportsOf(text: string): Named[] {
  const named: Named[] = [];
  const seen = new Set<string>();
  for (const found of text.matchAll(EXPORT)) {
    const name = found[2]!;
    if (seen.has(name)) {
      continue;
    }
    seen.add(name);
    const prose = docAbove(text, found.index);
    named.push({
      name,
      kind: kindOf(found[1]!),
      said: prose === undefined || prose === "" ? undefined : openingOf(prose),
    });
  }
  return named;
}

// The folder a file is grouped under: an offered folder that holds it, else
// its first folder under its source, else the source itself.
function groupOf(path: string, sources: readonly string[], offered: readonly string[]): string {
  const held = offered.find((folder) => path.startsWith(`${folder}/`));
  if (held !== undefined) {
    return held;
  }
  const source = sources.find((folder) => path.startsWith(`${folder}/`)) ?? "";
  const [first = "", ...rest] = posix.relative(source, path).split("/");
  return rest.length > 0 ? posix.join(source, first) : source;
}

/**
 * The catalogue of `texts`, a map of path to file text, read from `sources`. Groups come root
 * first, then by name; files by path; names in the order the file exports them.
 */
export function catalogueOf(
  texts: ReadonlyMap<string, string>,
  sources: readonly string[],
  config: CatalogueConfig,
  command: string
): Catalogue {
  const offered = config.offered ?? [];
  const glue = new Set(config.glue ?? []);
  const byStem = new Map([...texts.keys()].map((path) => [path.replace(/\.tsx?$/, ""), path]));
  const taken = new Map<string, Set<string>>();
  const takers = new Map<string, Set<string>>();
  for (const [path, text] of texts) {
    const group = groupOf(path, sources, offered);
    for (const found of text.matchAll(IMPORT)) {
      const stem = posix.join(posix.dirname(path), found[2]!).replace(/\.(?:js|tsx?)$/, "");
      const from = byStem.get(stem);
      const braces = /\{([^}]*)\}/.exec(found[1]!);
      if (from === undefined || braces === null || groupOf(from, sources, offered) === group) {
        continue;
      }
      const names = taken.get(from) ?? new Set<string>();
      for (const piece of braces[1]!.split(",")) {
        const name = piece
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)[0]!;
        if (name !== "") {
          names.add(name);
        }
      }
      taken.set(from, names);
      takers.set(from, (takers.get(from) ?? new Set<string>()).add(group));
    }
  }
  const listed: Listed[] = [];
  const missing: string[] = [];
  for (const [path, text] of [...texts].sort(([a], [b]) => a.localeCompare(b))) {
    const group = groupOf(path, sources, offered);
    const isWhole = !glue.has(path) && (offered.includes(group) || sources.includes(group));
    const names = exportsOf(text).filter((named) => isWhole || taken.get(path)?.has(named.name));
    for (const named of names) {
      if ((named.kind === "function" || named.kind === "class") && named.said === undefined) {
        missing.push(`${path}: ${named.name} has no doc comment`);
      }
    }
    if (names.length > 0) {
      listed.push({ path, group, names, takers: [...(takers.get(path) ?? [])].sort() });
    }
  }
  return { text: render(listed, sources, command), missing };
}

function render(listed: readonly Listed[], sources: readonly string[], command: string): string {
  const lines = [
    "# Catalogue: what exists, before you write",
    "",
    `Written by \`${command}\` from the doc comments, never by hand.`,
    "Listed is what is shared: every name a file in another folder takes,",
    "and every name in a folder that exists to be taken. Grouped by folder,",
    "then file; a file's takers are the folders that take from it. Look",
    "here first, then search the source, then write.",
  ];
  const groups = [...new Set(listed.map((file) => file.group))].sort((a, b) => {
    const rootA = sources.includes(a);
    const rootB = sources.includes(b);
    return rootA === rootB ? a.localeCompare(b) : rootA ? -1 : 1;
  });
  for (const group of groups) {
    lines.push("", `## ${group}`);
    for (const file of listed.filter((entry) => entry.group === group)) {
      const taken = file.takers.length > 0 ? ` (${file.takers.join(", ")})` : "";
      lines.push("", `**${file.path}**${taken}`);
      const quiet: string[] = [];
      for (const named of file.names) {
        const shown = named.kind === "function" ? `${named.name}()` : named.name;
        if (named.said === undefined) {
          quiet.push(`\`${shown}\``);
        } else {
          lines.push(`- \`${shown}\`: ${named.said}`);
        }
      }
      if (quiet.length > 0) {
        lines.push(`- Also: ${quiet.join(", ")}`);
      }
    }
  }
  return `${lines.join("\n")}\n`;
}
