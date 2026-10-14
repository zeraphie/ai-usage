---
name: add-reuse-row
description: Share a piece on its second use, in one change - move it to one home, replace every copy with a call to it, delete the copies, and add its row to the project's reuse table so the copies cannot come back. Use it when a step shares a piece, or when the reuse reading finds a second use and Izzy agrees to share it.
allowed-tools: Bash(bun tools/check-reuse.ts) Bash(bun tools/build-catalogue.ts *)
---

# Add a row to the reuse table

A shared piece and its row arrive together, in the same change as the
deleted copies. A shared piece beside its old copies is a third copy,
and a piece with no row can be copied again tomorrow. The rules behind
it are in `${CLAUDE_PLUGIN_ROOT}/rules/reuse.md`.

Share only on the second use, and only when the step says to or Izzy
has agreed. A piece with one caller stays where it is.

## 1. One home

Move the piece where both uses can reach it, by the project's own
"where things live" in its `.ai`: a UI's `atoms/` or `utils/`, a
domain's `shared/` folder, or the root of the source for vocabulary.
When it nearly fits both uses, change it to fit both; never keep two
versions. When the piece already has a home, it stays there.

## 2. The row, before the copies go

Write its row in `tools/reuse.config.ts`'s `table`:

- `what`: what a copy is, as the refusal says it: "an event dispatched
  by hand", "a focus ring written by hand".
- `pattern`: what a copy looks like in the source. Match what someone
  writing it again by hand would write, not the shared piece's name. Keep
  it narrow enough that nothing else matches, and wide enough to catch
  a copy with other variable names.
- `home`: the one file that writes it, from the project's root.
- `instead`: what to use instead, as code: "`emit()`".
- `within`: only when the pattern means something else outside some
  folders.
- `excused`: only for a file with a reason of its own to write the
  pattern, each with that reason in plain words.

Then run `bun tools/check-reuse.ts`. It should fail, naming every copy
still in the source. That proves the pattern catches them. A copy it
misses means the pattern is too narrow; a file it names that is no copy
means it is too wide.

## 3. The copies go

Replace each copy with a call to the shared piece, and delete the
copy's own code. Run `bun tools/check-reuse.ts` again: it passes once
no copy is left, and the home still writes the pattern.

## 4. When the project keeps a catalogue

Give the shared piece's export a doc comment that opens with one plain
sentence saying what it is for, and run `bun tools/build-catalogue.ts`,
so the catalogue lists it under its home.

## 5. Later moves

When a file a row names is moved or renamed, its row follows it in the
same change, or the check fails on the stale row.

## 6. Report

Say what was shared, its home, which copies went, and the row's
`what`. The reuse reading names the piece under **Reused**.
