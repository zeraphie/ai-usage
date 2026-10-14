# Lit

For a project that names `lit` in the `stacks` of its `.ai/base.json`.
Its custom elements follow atomic design, as the reuse rules say.

- Elements are classes, by necessity; pure logic stays plain functions
  in modules that never import Lit.
- `useDefineForClassFields: false` in the tsconfig. A reflecting boolean
  `@property` that defaults to `false` otherwise discards an attribute
  the author set before the element upgraded. For an opt-in flag, read
  a plain attribute.
- **Never a backtick inside a CSS comment in a `css` template.** The
  template ends there, and the parse error points several lines away.
- Styles a few elements share are one fragment, exported once and taken
  into each element's styles, or adopted stylesheets for a base every
  element has. Colours come only from the design tokens' custom
  properties, never a hard-coded value.
- Visual state goes through custom properties and attribute selectors.
  Across a shadow root, through the element's own custom properties and
  `::slotted` attribute selectors.
- An event an element sends bubbles and crosses shadow roots, through
  the one shared helper that sends it, so no element builds a
  `CustomEvent` by hand.
- **Every element class has its manifest JSDoc**: the class's purpose,
  then `@fires`, `@slot`, `@cssproperty` and `@csspart` for each it has.
  The custom-elements manifest, the docs and editors' completions are
  made from it, so it changes with the API.
- A package of elements stays free of any one app's host, such as
  Tauri, so a second app or a browser can take it.
- Public exports go through the package's one barrel, `index.ts`.
