# Reuse

How code stays in one place. These rules are the same in every repo of
Izzy's. A project's own `.ai` names its folders, its layers and its
table; nothing here names a path.

## Why

A person who has worked in a repo for a month reuses what is there,
because they know it is there. Someone new writes it again, because
finding out costs more than writing, and an agent is new every time.
Nothing fails when they do. So a project does two things: it makes what
exists cheap to see, and it makes a second copy fail a check. It does
both from its first line, so the rule holds before the first copy
exists.

## Look before you write

- Before a new function, component, style, constant or helper, look for
  the one that exists: the catalogue when the project has one, then a
  search of the source for the verb and the noun.
- Reuse it as it is. When it nearly fits, change it to fit both uses.
  Never copy it and change the copy.
- The second use is the moment to share. The first time, write it where
  it is used. The second time, move it to where both can reach it and
  call it from both places. Never a third copy.
- Never a helper kept for later. Nothing is written for a use that does
  not exist yet, and a shared piece with one caller is not shared.
- A refactor that shares a piece deletes the copies in the same change.
  A shared piece beside its old copies is a third copy.

## The reuse reading

Every report on a piece of work ends with three lines:

- **Looked for:** what the work could have found already written.
- **Reused:** what it took, and from where.
- **Not found:** what it looked for and did not find.

"Nothing to reuse" is an answer. Saying nothing is not.

When the reading finds that something already existed and was written
again, the search has stopped being enough. Say so, and ask Izzy
whether the project moves to robust reuse, with its catalogue.

## Where things live

A folder says what kind of thing is in it, so a glance shows the
vocabulary.

- **A UI sorts by layer, not by feature** (atomic design):
  - `atoms/`: one element or one look, with no state of its own and no
    knowledge of the domain.
  - `molecules/`: a few atoms with one purpose. It knows one thing of
    the domain and owns no flow.
  - `components/`: a piece of the screen that owns a flow and its state.
  - `utils/`: no elements. Hooks, events, text, keys, pure tables.
  - Imports go down that list, never up. A component also takes what is
    in its own folder.
  - Atoms and molecules are flat files. A component keeps a helper of
    its own until a second one needs it; then it moves to `utils/`, or
    to `atoms/` when it is a look.
  - A repeated run of styles or classes is an atom: exported once, and
    taken in wherever it is needed.
- **Everything else sorts by domain.** What a second domain uses is
  shared where it sits, or moves to a `shared/` folder, where a glance
  finds it.
- **What has no domain is vocabulary**, and sits at the root of the
  source, such as the point and the rect every folder speaks in.
- **A folder past about ten files** sorts again into subfolders named
  for what a reader looks for, in plain words, with its face (the entry,
  the barrel) left at its root.
- **Tests share fixtures the same way.** A test file keeps a fixture of
  its own until a second file needs it; then it moves to the tests'
  shared fixtures.

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
