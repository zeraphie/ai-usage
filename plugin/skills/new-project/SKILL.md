---
name: new-project
description: Put a project on Izzy's shared base. It asks Izzy a handful of questions, then writes only the project's own layer, its .ai/CLAUDE.md, .ai/base.json and reuse config, copies in the reuse check, and wires bun run check so it passes on the first run. Use it when Izzy starts a project, or asks to put one on the base.
disable-model-invocation: true
argument-hint: "[project folder]"
allowed-tools: Read(${CLAUDE_PLUGIN_ROOT}/**) Read(${CLAUDE_SKILL_DIR}/**) Bash(bun ${CLAUDE_PLUGIN_ROOT}/tools/copy-reuse.ts *) Bash(bun ${CLAUDE_PLUGIN_ROOT}/hooks/session-start.ts sync *) Bash(bun run check) Bash(bun tools/check-reuse.ts) Bash(bun tools/build-catalogue.ts *)
---

# A new project on the base

The base (workflow, reuse, style, testing, security, the stack layers)
lives in the ai-usage plugin and reaches every session by itself. A
project's `.ai` holds only what is its own. This skill writes that layer
and nothing else: no app code, no stack scaffolding.

The project is `$ARGUMENTS`, or the current folder when none is given.

## 1. Look first

Read what the folder already has: its `package.json` and scripts, its
lint and format configs, its source folders, any `.ai/`, `CLAUDE.md`,
`.gitignore` and `tools/`. Never overwrite a file the project already
has; add to it, and say what was added. A project already on the base
(it has `.ai/base.json`) is updated, not started again.

## 2. Ask, in one message

Ask Izzy these, each with options on short lines and what was read
filled in as the likely answer. Never pick for Izzy.

1. **What it is**, in a sentence or two, and its stack.
2. **Stack layers**: `react`, `lit`, `tailwind`, `astro`, or none. Astro
   is Izzy's choice for a static site that needs navigation.
3. **Options**: `stories` (story tests tied to a stories document),
   `fintech` (it handles money), `look` (how it looks is Izzy's call).
4. **Light or robust reuse.** Light for a short or early project: a
   table and import rules, no catalogue. Robust for a long one: type-only
   imports counted, and a catalogue.
5. **Where things live**: its source folders, and the import rules
   between them, proposed from the folders read (a web app and a server
   never take each other's code; a UI's layers only take downwards).
6. **Remote and deploys**: local until Izzy asks, or the remote and
   where a push deploys.
7. **Its own rules and checks**: anything only this project holds to (a
   runtime dependency set, a budget, a rule of its domain), and any
   check beyond the usual ones.
8. **MCP servers**: any this project needs, which go in its own
   `.mcp.json`. The base ships none; they are chosen project by
   project.

## 3. Write the layer

- **`CLAUDE.md`** holds only `@.ai/CLAUDE.md`.
- **`.ai/CLAUDE.md`** from `${CLAUDE_SKILL_DIR}/template.md`, filled in
  from the answers. Keep it to what is the project's own: the base is
  never repeated there.
- **`.ai/base.json`**: `{ "stacks": [...], "options": [...] }`, from
  questions 2 and 3.
- **The reuse check**: run
  `bun ${CLAUDE_PLUGIN_ROOT}/tools/copy-reuse.ts <project>`. Then fill
  in `tools/reuse.config.ts`: `mode`, `sources`, and `imports` from
  question 5. The `table` starts empty.
- **`package.json` scripts**, added beside what is there:
  - `reuse:check`: `bun run tools/check-reuse.ts`
  - for robust: `catalogue` (`bun run tools/build-catalogue.ts`) and
    `catalogue:check` (the same with `--check`), and
    `@CATALOGUE.md` under "What exists" in `.ai/CLAUDE.md`
  - `check`: the project's format check, lint, typecheck and tests, with
    `reuse:check` (and `catalogue:check`) in the chain
- **Lint and format**: the copies in `tools/` print, so the lint config
  lets `tools/**` use the console. When the project's formatter would
  rewrite a copy, add the copies to its ignore patterns, since a
  rewritten copy fails its stamp.
- **`.gitignore`** gains `.plan/`, and `.claude/rules/ai-usage/`, where
  the base writes the project's layers each session.
- **`.mcp.json`**, only when question 8 named a server.
- **`.plan/`** exists, empty.
- **No `DECISIONS.md` and no design doc.** Decisions go in an ADR per
  topic in `.plan/`. Never `git init`, a remote or a push unless Izzy
  asked.

## 4. Bring the layers in now

Rules files are read before the session-start hook runs, so the layers
it writes from `.ai/base.json` would otherwise first reach the session
after next. Run the hook's sync part for the project:

`bun ${CLAUDE_PLUGIN_ROOT}/hooks/session-start.ts sync <project> ${user_config.delivery}`

With rules delivery it writes `.claude/rules/ai-usage/`; with context
delivery it writes nothing, as the hook hands the layers over itself.

## 5. Check, and report

Run `bun run check`. It must pass on the first run: a project's start is
never spent on checks failing on nothing. When a part has nothing to
check yet (no tests, no source), give it the flag that lets an empty
run pass and say so, so it comes out once there is something to check.

Report what was written and added, file by file, the answers it rests
on, that the sync ran and what it wrote (so the next session starts with
the layers), what the check said, and end on the reuse reading.
