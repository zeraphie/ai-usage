# Tailwind

For a project that names `tailwind` in the `stacks` of its
`.ai/base.json`.

- Tailwind v4 utilities for layout, spacing and type, through its Vite
  plugin, with no PostCSS config.
- **Tokens are declared once**, in the main stylesheet under `@theme`,
  so every colour and size is a name. No hard-coded palette value in a
  component. Anything drawn outside the DOM, such as a canvas, reads the
  same custom properties through one bridge.
- State is styled through attributes: a library's `data-state`, the
  app's own `data-*`, `aria-*`. Never inline `style` for visual state.
- A repeated run of classes is an atom: one string, exported once, and
  taken into each `className` that needs it.
- A CSS module only where a utility list stops reading, such as a
  keyframe or a nested state.
- Motion respects `prefers-reduced-motion`.
