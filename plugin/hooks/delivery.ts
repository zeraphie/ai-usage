/**
 * ─ Delivery ─
 *
 * Which of the base's rules a session gets, and where they go. The
 * workflow and reuse rules load at every start; the reuse tools, style
 * and testing load with the files they are about; security is read when a change calls
 * for it. A project's own stack layers and options go to the project
 * alone. Pure: it is handed the texts and returns what to write.
 */

/** What a project names of the base, in its `.ai/base.json`. */
export interface ProjectBase {
  /** The stack layers it takes, by name: `react`, `lit`, `tailwind`, `astro`. */
  readonly stacks?: readonly string[];
  /** The options it turns on: `stories`, `fintech`, `look`. */
  readonly options?: readonly string[];
}

/** The base's rules files, by when they load. */
export const ALWAYS = ["workflow.md", "reuse.md"];
export const WITH_FILES = ["reuse-tools.md", "style.md", "testing.md"];

/** The options a project may name. */
export const OPTIONS = ["stories", "fintech", "look"];

/** The file a project's own rules note is written to, beside its stack layers. */
export const PROJECT_NOTE = "project.md";

/** `text` with `{{rules}}` pointing at the plugin's rules folder, so a rule can name a file to read. */
export function placed(text: string, rulesDir: string): string {
  return text.replaceAll("{{rules}}", rulesDir.replaceAll("\\", "/"));
}

/** The rules every session on the machine gets, by file name, from `read`, which reads a rules file. */
export function userRules(read: (name: string) => string, rulesDir: string): Map<string, string> {
  return new Map(
    [...ALWAYS, ...WITH_FILES].map((name) => [name, placed(read(name), rulesDir)] as const)
  );
}

/**
 * The rules a project gets of its own: each stack layer it names, and a note of its options. Every
 * name the base does not know is a problem.
 */
export function projectRules(
  base: ProjectBase,
  stacks: ReadonlyMap<string, string>
): { readonly rules: Map<string, string>; readonly problems: string[] } {
  const rules = new Map<string, string>();
  const problems: string[] = [];
  for (const stack of base.stacks ?? []) {
    const text = stacks.get(stack);
    if (text === undefined) {
      problems.push(`.ai/base.json names the stack "${stack}", which the base has no layer for`);
    } else {
      rules.set(`${stack}.md`, text);
    }
  }
  for (const option of base.options ?? []) {
    if (!OPTIONS.includes(option)) {
      problems.push(
        `.ai/base.json names the option "${option}"; the options are ${OPTIONS.join(", ")}`
      );
    }
  }
  rules.set(PROJECT_NOTE, noteOf(base));
  return { rules, problems };
}

// What the project's own rules note says: its layers and options, as the
// base's rules refer to them.
function noteOf(base: ProjectBase): string {
  const stacks = base.stacks ?? [];
  const options = (base.options ?? []).filter((option) => OPTIONS.includes(option));
  return [
    "# This project's base",
    "",
    "Written from `.ai/base.json` at the start of each session; change that file, not this one.",
    "",
    `- Stack layers: ${stacks.length > 0 ? stacks.join(", ") : "none"}.`,
    `- Options: ${options.length > 0 ? options.join(", ") : "none"}.`,
    "",
  ].join("\n");
}

/**
 * What to do to `have`, the files a folder holds now, so it holds `want`: the files to write, new
 * or changed, and the files to remove. Unchanged files are left alone.
 */
export function changes(
  want: ReadonlyMap<string, string>,
  have: ReadonlyMap<string, string>
): { readonly write: [string, string][]; readonly remove: string[] } {
  const write = [...want].filter(([name, text]) => have.get(name) !== text);
  const remove = [...have.keys()].filter((name) => !want.has(name));
  return { write, remove };
}

/** The session context for one rules file, when the rules are handed to the session itself. */
export function contextOf(text: string): string {
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: text },
  });
}

/**
 * The note that stands in for the rules that load with their files or when relevant, when the
 * rules are handed to the session itself and cannot be scoped.
 */
export function onDemandNote(rulesDir: string): string {
  const dir = rulesDir.replaceAll("\\", "/");
  return [
    "# The rest of the base",
    "",
    `- Before writing or changing source code, read \`${dir}/style.md\`.`,
    `- Before changing \`tools/\` or the catalogue, read \`${dir}/reuse-tools.md\`.`,
    `- Before writing or changing a test, read \`${dir}/testing.md\`.`,
    `- A change that touches security is read against \`${dir}/security.md\`.`,
    "",
  ].join("\n");
}
