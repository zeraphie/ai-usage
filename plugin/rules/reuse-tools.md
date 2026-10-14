---
paths:
  - "**/tools/**"
  - "**/.ai/CATALOGUE.md"
---

# Reuse: the tools

What enforces the reuse rules in each project. The rules themselves are
in `reuse.md`.

## The reuse check

The project's `bun run check` runs `tools/check-reuse.ts`, which reads
the project's table from `tools/reuse.config.ts`.

- **A row** names a shared piece: what a copy is, what a copy looks like
  (a pattern), the one file that writes it, and what to use instead. A
  copy anywhere else in the source fails the check.
- **A row arrives with its piece.** When a step shares a piece, its row
  goes in the table in the same step, so the copies cannot come back.
  The table starts empty.
- **An excuse carries its reason.** A file with a reason of its own to
  write the pattern is named in the row with that reason.
- **A stale row fails.** A row whose home or excused file no longer
  writes the pattern fails the check, so the table stays true.
- **A row may hold for some folders only**, when the pattern means
  something else elsewhere.

## Import rules

The same config says which areas of the project may take code from
which. An area is a folder from the root, and a file belongs to the
deepest area that holds it.

- **Either shape.** A rule says what an area may not take (the web app
  never takes the server's code), or all it may take (an atom takes only
  atoms and utils). Pick whichever reads plainer for that area.
- **A component's own folder** may be let through, so a component takes
  its own helpers and no other component's.
- **Light or robust.** A light project, short or early, lets a
  type-only import cross any rule, since it is gone when the code runs.
  A robust project, long-lived and thorough, counts it: a layer does not
  lean on a higher one even for its types. The config's `mode` sets
  this, and `typeImports` may set it apart.

## The copy in each project

The reuse check lives once, in the plugin, and each project holds a
copy in its `tools/`, so `bun run check` runs it the same in a terminal
and in CI.

- **A copy is never edited by hand.** Each copied file opens on a stamp
  with a hash of itself; a copy changed by hand fails the check. Change
  the tool in the plugin, and copy it again.
- **The config is the project's own.** Copying writes a starting
  `tools/reuse.config.ts` only when there is none, and never replaces
  one.
- **A stale copy is found from the plugin.** Where the plugin is there,
  its copy step's `--check` says whether a project's copies are older
  than the plugin's.

## The catalogue

A robust project keeps a catalogue of what it shares, in
`.ai/CATALOGUE.md`, which its `.ai/CLAUDE.md` imports, so a session
starts knowing what exists. A light project has none: its source is
small enough that the search is the catalogue.

- **It is written by a tool, never by hand.** `bun run catalogue`
  writes it from the doc comments, and `bun run check` refuses a stale
  one.
- **It lists what is shared**: every name a file in another folder
  takes, and every name in a folder that exists to be taken (the root's
  vocabulary, a UI's atoms, molecules and utils).
- **Each name says what it is for**, in the sentence its doc comment
  opens on. A listed function or class with no doc comment fails the
  run. So an exported name's doc comment opens with one plain sentence
  saying what it is for, in a light project too, and the catalogue can
  be made the day it is wanted.
