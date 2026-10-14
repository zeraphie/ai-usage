# ai-usage — CLAUDE.md

One standard source for how Izzy uses AI across their repos: a shared
base (the workflow, the formats, the reuse rules and the tools behind
them) plus a small bespoke layer per project, packaged as a Claude
Code plugin installed once per machine, so the base loads on demand
instead of being copied from repo to repo. Each project's `.ai`
folder keeps only what is truly its own.
**Reuse is the point.** Every project gets it from its first line,
and the tools for it are shared, never copied.
Decisions live in an ADR per topic in `.plan/`, beside its plan.
There is no design doc yet. **Public on GitHub** as `zeraphie/ai-usage`:
push only when Izzy asks, and never submit it to Anthropic's plugin
directory.

## Workflow

Research → decisions → plan → execute, one step at a time.

1. Substantial work starts as research and discussion, and lands in
   the topic's ADR, `.plan/<topic>.adr.md`: what was decided, why,
   what else was weighed, and what it cost.
2. Plans derive from it as `.plan/<topic>.plan.md`: checkbox per
   step, and a "Not doing" list.
3. Execute one step at a time. After each step:
   - tick the checkbox, run the checks
   - **explain what was done, how it works, and why this approach
     over the alternatives**: the explanation is part of the
     deliverable, not a courtesy
   - end on the reuse reading: what was looked for, what was reused,
     what was not found
   - stop and wait for Izzy before the next step
4. Never auto-advance.
5. Open decisions are surfaced as questions with options. Don't pick
   for Izzy: never "I'd lean toward X" and ship.

## Scope

Do exactly what the step says. Anything extra is a question, not
something done on the way. If a step grows, stop and split it.

## Reuse

The rules this repo writes down for every other repo apply here
first:

- Look before you write.
- Share on the second use, not the first, and not before.
- Never a helper kept for later: nothing is written for a use that
  does not exist yet.
- A refactor that shares a piece deletes its copies in the same
  change.

## House rules

- **Check the docs, not memory.** Before writing any Claude Code
  plugin, skill, subagent, hook or MCP file, read the current Claude
  Code docs for its format.
- **Read only, everywhere else.** Nothing outside this folder is
  changed from here: everything else in
  `C:\Users\Izzy\Documents\Development`, including tablewright,
  atelier, gossamer, hexpunk, izelya.me, warrior-of-keyboard,
  i-dotfiles and setup, is read, never written.
- **Commits.** Commit when a step lands or when asked, and only after
  the checks pass. `type(scope): short description`, the scope left out
  when a change has no single area; subject-only, no Co-Authored-By or
  any other trailer. No push unless Izzy asks.
- **The prose is Izzy's.** README.md is written by Izzy; agents
  propose its structure and supply the facts, but don't write it.
- Plain English. No emoji.

## Key paths

- `.claude-plugin/marketplace.json`: the local marketplace; the repo
  root is its root
- `plugin/`: the plugin itself, what ships: its manifest in
  `plugin/.claude-plugin/plugin.json`, and its parts as they arrive
- `package.json`: `bun run check` (format check, lint, tests, and
  `claude plugin validate` on the marketplace and the plugin)
- `.plan/`: local-only and gitignored. Files are named by topic first,
  so a topic's files sit together: `<topic>.research.md`,
  `<topic>.adr.md`, `<topic>.plan.md`, and reference images and files.
  A topic with more files than those three becomes a folder,
  `<topic>/research.md`, `<topic>/adr.md`, `<topic>/plan.md` and the rest
