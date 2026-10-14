---
name: reuse-reading
description: Reuse, at both ends of any change to code. Use it before the first edit, to look for what exists that the change could reuse, and again when the work is done, before the report goes to Izzy, to say what was looked for, what was reused and what was not found, and to catch a copy before it lands.
allowed-tools: Bash(git status *) Bash(git diff *) Bash(bun ${CLAUDE_PLUGIN_ROOT}/tools/copy-reuse.ts *)
---

# The reuse reading

Reuse happens at both ends of a change. Before the first edit, look for
what the change could reuse. After the work, look again, and end the
report on what was looked for, what was reused, and what was looked for
and not found. The rules behind it are in
`${CLAUDE_PLUGIN_ROOT}/rules/reuse.md`.

## 0. Before the first edit

List what the change will need, each function, component, style,
constant, type or helper, and look for each as in part 2. Write down
what was found, to reuse, and write only what was not. Then make the
change, and come back to part 1 when it is done.

## 1. What the work added

List what the step wrote or changed: run `git status --short` and
`git diff` where the project is a repo, and take the files the step
touched where it is not. From those, list every new name a reader could
look for: a function, a class, a component, a constant, a style, a type,
a helper, a test fixture.

## 2. Look for each one

For each new name, look in this order, and stop at the first that
answers:

1. `.ai/CATALOGUE.md`, when the project has one.
2. The table in `tools/reuse.config.ts`: a row whose pattern the new
   code matches, or whose piece does the same job.
3. A search of the source for the verb and the noun of what the name
   does, not only its spelling: `distance`, `measure` and `length` are
   one search.

## 3. Read what was found

Each name ends as one of these:

- **Reused**: the work took what existed. Name it and where it lives.
- **Not found**: nothing did the job. Name what was searched for.
- **Second use**: something did the same job, and the work wrote it
  again, or both are now in use. This is the moment to share: move it
  to where both can reach it, delete the copies in the same change, and
  add its row to the table. That is a change to the work, so ask Izzy
  before making it, unless the step already says to share.
- **Missed**: it existed, and the work wrote it again without finding
  it. Say so plainly. When the project's reuse config is light (its
  `mode` is left out or is `light`), the search has stopped being
  enough: ask Izzy whether the project moves to robust, with its
  catalogue.

## 4. Check the copies

When the project has `tools/check-reuse.ts`, run
`bun ${CLAUDE_PLUGIN_ROOT}/tools/copy-reuse.ts <project root> --check`.
When it reports copies older than the plugin's, say so in the report;
copying them again is Izzy's call, as it changes the project's tools.

## 5. The three lines

End the report with them, in this shape:

- **Looked for:** what the work could have found already written.
- **Reused:** what it took, and from where.
- **Not found:** what it looked for and did not find.

Add a fourth line only for a second use, a miss or a stale copy, saying
what was found and the question it raises. "Nothing to reuse" is an
answer. Saying nothing is not.
