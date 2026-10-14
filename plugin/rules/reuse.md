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

**Reuse starts the moment code is touched**, before the first edit, not
at the end of the step. A copy found after it is written is already a
copy.

- Before any code is written or changed, list what the change will need:
  each function, component, style, constant, type or helper. Then look
  for each one that exists: the catalogue when the project has one, the
  table in `tools/reuse.config.ts`, then a search of the source for the
  verb and the noun of what it does, not only its spelling.
- Write only what the look did not find, and keep what it found to
  reuse.
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

- **A UI sorts by layer, not by feature** (atomic design), whatever
  renders it: React components, Lit custom elements, or plain markup
  styled with Tailwind. Read "element" as whichever the stack has:
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

## The tools

The reuse check, its import rules, its copy in each project and the
catalogue are in `reuse-tools.md`, which loads with any source file, the
project's `tools/` and its catalogue.
