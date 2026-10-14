# Style

The house style, the same in every repo of Izzy's. A stack's own rules
(React, Lit, Rust, GLSL and the rest) live in its own layer, or in the
project's `.ai` until a second project shares the stack. Formatting is
oxfmt's job and linting is oxlint's; style review is about what the
tools cannot check.

## Principles

- Readability over cleverness. Start simple and earn complexity: don't
  abstract until there is a second use.
- **Classes by default** where the language supports them well. Where a
  stack's grain is functional, go with it, as React's function
  components do: a class where a thing owns a lifetime and state, plain
  functions for pure logic. A default, not a rule.
- **Split files early.** One concern per file. Around 250 lines, look
  for a sensible seam; around 400, finding one is a priority. Judgment,
  not a lint rule. Tests and scripts are exempt.
- **Fold folders early.** A folder past about ten files gets subfolders
  named for what a reader looks for, in plain words, never
  abbreviations, and keeps its face at the root: the entry, the barrel.
  The tests mirror the same folders.
- **Every dependency needs a case.** The project's `.ai` names its
  runtime set; the default answer to another is no. Dev tools need a
  case too.
- **One dev/prod switch per layer**, provided by the toolchain: a
  build-time define, or the bundler's own flag. No runtime environment
  sniffing.
- **Visual state is state-driven:** data attributes and custom
  properties, never inline style writes for visual state. Geometry,
  such as a position from a camera, is exempt.
- No emoji in technical writing.

## Comments

- Comments exist for three reasons only: the intent of a file or
  function; reference for the next person; explaining genuinely complex
  code, what it does and why it was done that way. Never narrate what
  the code says.
- Plain English: common words, short declarative sentences, active
  voice. State the constraint or the reason and stop. One sentence is
  the default; a second earns its place by carrying a why.
- The domain's own words are not waffle. They are the system's real
  names, and they are used.
- **A non-obvious file opens with a preamble:** a bare `/**` opener, a
  `─ title ─` line, a blank gutter line, tapered prose of about six
  lines at most, and `*/` on its own line. Trivial files get nothing.
- **A comment carries its own reason.** It never points outside the
  file: not to a plan, an ADR, a decision number or a chat. Those are
  local, so the pointer leads nowhere.
- `/**` above a declaration is that symbol's hover doc, and the nearest
  docblock wins, so a file's first declaration keeps a `/**` of its own
  under the preamble. `//` is for inline comments.
- An exported name's doc comment opens with one plain sentence saying
  what it is for. That sentence is what the next person searches, and
  what a catalogue lists.
- A constant carries inline rationale where its value is not
  self-evident: where a number came from.
- Box-drawing section dividers (`// ── Section ──`) are there for long
  files.

## Prose

- Every word added to a repo is plain English, in markdown as in
  comments. A document reads like a person explaining, never like a
  generator.
- A decision says why. A plan says when. Neither narrates the code.
- Text on screen takes ordinary punctuation and never a middle dot: a
  colon between a label and its value, a dash between peers, a comma in
  a list.

## TypeScript

- Strict, plus `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch`, `isolatedModules` and
  `verbatimModuleSyntax`. No `any`.
- Private class members use the `private` keyword. In JavaScript, a
  `#name` private field.
- Explicit `.js` extensions on relative imports.
- Guard at the boundary and return early; no defensive re-checks deep
  inside.

## JSDoc

JSDoc is how a JavaScript or TypeScript library explains itself: editors
infer from it, docs and manifests are generated from it, and a catalogue
lists by it. So it is written once, in the source, and kept true.

- Every exported name has it: its purpose in prose, opening with one
  plain sentence saying what it is for.
- In TypeScript, the tags the type alone does not carry: `@throws`,
  `@example`, `@deprecated`, a unit or a range a number holds.
- In plain JavaScript, it carries the types too: `@param {type}`,
  `@returns {type}`, `@typedef`, with `{types}` in braces, so editors
  infer them and docs can be generated without revisiting the file.
- Every tag says something the name alone does not.
- A non-exported function needs none.
- When a tool reads it, such as a custom-elements manifest, the stack's
  layer names the tags it needs, and they are mandatory there.

## Naming

| Thing                 | Convention                  | Example              |
| --------------------- | --------------------------- | -------------------- |
| Files                 | `kebab-case`                | `scene-camera.ts`    |
| Variables / functions | `camelCase`                 | `snapToGrid`         |
| Classes / components  | `PascalCase`                | `BoardStage`         |
| Constants             | `SCREAMING_SNAKE_CASE`      | `GRID_CELL_PX`       |
| Booleans              | `is` / `has` / `can` prefix | `isRevealed`         |
| Collections           | plural noun                 | `emitters`           |
| Git branches          | `type/short-description`    | `feat/ruler-tool`    |

## Tooling

- Bun only: `bun add`, `bun run`. Never npm or yarn.
- `bun run` scripts by default. A `justfile` over them is an option a
  project adds; it stays a thin layer, and the scripts work without it.
- One gate, `bun run check`, run after every step: at least the format
  check, lint, typecheck, tests and the reuse check. It runs in seconds;
  keep it so. A new project's check passes on its first run.
- **oxlint** for lint: `eqeqeq`, `no-var`, `prefer-const`,
  `object-shorthand`, `curly`, `no-else-return`, `no-lonely-if`, and
  unused variables an error unless `_`-prefixed.
- **oxfmt** for format: 100 columns, 2 spaces, semicolons, double
  quotes, `trailingComma: es5`, `arrowParens: always`, LF.
- A file a tool writes is never edited by hand. It says at its top which
  tool wrote it; run the tool.

## Commits

- Commit when a step lands or when asked, and only after the checks
  pass.
- `type(scope): short description`, with the scope left out when a
  change has no single area. Types: `feat`, `fix`, `refactor`, `docs`,
  `chore`, `test`, `style`, `perf`, `ci`, `revert`. Present tense,
  imperative.
- Subject only: no body, and no Co-Authored-By or any other trailer.
  The log reads as a list; the reasons live in the ADR.
- No remote, no push and no deploy unless Izzy asks.

## Errors a person sees

- Say what went wrong, what was received, what was expected, and what
  they can do about it.
- Typed errors or error codes for code that handles them. Never swallow
  an error silently.
- A degraded, loading or empty state is named and visible, never a
  mystery blank or a blocked action.
