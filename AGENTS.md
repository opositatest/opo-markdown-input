# AGENTS.md

Compact guidance for OpenCode sessions in this repo.

## Commands

```bash
npm run dev                    # Start dev server (Vite, React harness)
npm run build                  # tsc -b + vite build (React app only, not the web component)
npm run build:web-component    # Build web component bundle (dist/editor.js + dist/editor.css)
npm run build:react            # Build React entry only
npm run build:package          # Build both web component + React (full package output)
npm run typecheck              # tsc -b (no emit, just type-check)
npm run lint                   # ESLint (flat config, TS+React)
npm run test                   # Vitest (unit tests, see vitest.config.ts)
npm run release                # release-it: lint → typecheck → build:package → git tag + GitHub release
```

Requires Node 24 (`.node-version`).

## Architecture

This is a published npm package (`@opositatest/markdown-text-editor`) shipping a rich-text Markdown editor as both a **Web Component** and a **React component**.

### Build targets

- **Web component**: `vite.web-component.config.ts` → `src/web-component-entry.ts` → `dist/editor.js` + `dist/editor.css`. Self-contained (no runtime imports), `cssCodeSplit: false`, `codeSplitting: false`. An `esmMarker` plugin appends `export {};` to the output so the single-file bundle is a valid ESM module.
- **React app**: `vite.react.config.ts` → `src/react-entry.ts` → published React component.
- **Dev harness**: `vite.config.ts` → `src/main.tsx` → exercises the web component in a form context.

### Source layout

```
src/
  markdown-text-editor/     # The web component (HTMLElement, form-associated)
    markdown-text-editor-element.tsx
  editor/                   # BlockNote-based editor internals
    editor-field/
    math-block/             # Custom BlockNote block for LaTeX (KaTeX)
  components/               # Shared React components
    app-block-note-view/
    app-block-note-suggestion-menu/  # Custom slash menu
  hooks/                    # Custom React hooks
  web-component-entry.ts    # Web component entry point
  react-entry.ts            # React component entry point
  main.tsx                  # Dev harness entry
```

### Key facts

- Custom element tag: `<markdown-text-editor>` (NOT `<draft-to-api-editor>`)
- Uses `ElementInternals` for native form participation (submit, validation), with hidden-input fallback
- No Shadow DOM — all elements are in the regular DOM, fully styleable from the host page
- CSS custom properties: `--border-color`, `--heading-color` on the element
- BlockNote v0.47.x for rich-text, KaTeX for math rendering
- `process.env.NODE_ENV` is statically replaced in web component build to avoid runtime errors

## Gotchas (read before touching the slash menu or `AppBlockNoteView`)

These are real incidents, not hypotheticals — a fix for one block type silently changed behavior for others.

- **`AppBlockNoteView` boolean props are global, not per-block-type.** `filePanel`, `tableHandles`, `sideMenu`, `slashMenu`, `linkToolbar` in `src/components/app-block-note-view/app-block-note-view.tsx` apply to the whole `BlockNoteView`, not to a single block. Flipping `filePanel` to `true` to fix image upload (commit `1618f71`) also made the `video`, `audio`, and `file` blocks fully functional — they went from inert slash-menu entries to working upload UI as a side effect. **Before flipping one of these flags, check every block type that shares the same panel/handle**, and if some of them should stay out of scope, hide them explicitly (see `DEFAULT_HIDDEN_SLASH_MENU_ITEM_IDS` below) instead of relying on the panel being off.
- **Slash menu items are filtered by stable `id`, not by the localized `title`.** `hiddenSlashMenuItems` and `enabledMediaBlocks` (`src/editor/hooks/use-editor-field-controller.ts`) do `.includes(item.id)`. `id` values are defined once in `src/editor/editor-schema.ts` and are meant to stay stable across locales/renames of `title`. Changing an `id` (or renaming without keeping the old one as an alias) is a **breaking change for any consumer** using `hidden-slash-menu-items` / `enabled-media-blocks` — it fails silently (no error, the filter just stops matching and the item reappears). If an `id` must change, update the README table in the same commit and call it out explicitly in the commit message / CHANGELOG.
- **`video`, `audio`, and `file` are hidden from the slash menu by default** via `DEFAULT_HIDDEN_SLASH_MENU_ITEM_IDS` in `src/editor/editor-schema.ts` (they're upstream BlockNote media flows this package doesn't document/support — see README's "Scope note"). Consumers opt in per-id with `enabledMediaBlocks` / `enabled-media-blocks`. When adding a new block type to `editorSchema`/the slash menu, decide explicitly whether it belongs in that default-hidden set instead of assuming visible-by-default is fine.
- **A typed number is text, never a list, and pasting does not guess Markdown.** Three places hold that behaviour and must stay in sync: `src/editor/numbered-list-numbering.ts` (the schema wrapper that drops BlockNote's `1. ` autoformat — a numbered list item paints its number from the item's position, so it can never display a number the author typed; keeping the autoformat and only declining when the number differs was tried and leaves `2. 3. apartado tres`), `src/editor/markdown-block-escape.ts` (escapes a paragraph's leading block marker on save, otherwise `3. No será preciso` is stored verbatim and comes back as a list item), and `src/editor/paste-handler.ts` wired in `src/editor/hooks/use-app-block-note-editor/use-app-block-note-editor.ts` (BlockNote parses pasted `text/plain` as Markdown by default *and prefers that guess over `text/html`*, which turned pasted apartados into an auto-numbered list: `1.`, `3.` → `1.`, `2.`). **Do not "simplify" `editorSchema` back to plain `defaultBlockSpecs`, and do not drop the `pasteHandler`**: both fail silently, and only `numbered-list-numbering.test.ts`, `numbered-list-typing.test.ts`, `paste-handler.test.ts` and `editor-field-markdown.roundtrip.test.ts` catch it.
- **Indentation is out of scope, and swallowing `Tab` is only half of it.** `src/editor/no-tab-indentation.ts` kills the *shortcut* (`Tab`/`Shift-Tab` leave the editor), but BlockNote also ships `nestBlockButton` / `unnestBlockButton` in its default formatting toolbar, and those kept nesting a block with one click — tooltip included (`Anidar bloque` + `Tab`). They're filtered out by upstream item `key` in `EXCLUDED_ITEM_KEYS` (`src/components/app-block-note-view/app-formatting-toolbar.tsx`), pinned by `app-formatting-toolbar.test.tsx`. Same silent-failure class as the slash-menu `id` filter below: an upstream rename just makes the buttons reappear. The side-menu drag handle (the other nesting affordance) stays off via `sideMenu={false}`.
- Keep `src/editor/editor-schema.test.ts` (item ids/titles/groups) and `src/editor/hooks/use-editor-field-controller.test.ts` (hide/enable filtering) in sync with any slash-menu change — they're the guardrail that would have caught the above.

## Verification

Before committing, run:
```bash
npm run lint && npm run typecheck && npm run test
```

## Release

`release-it` handles releases. Pre-init hooks run `lint` and `typecheck`; post-bump runs `build:package`. The web component build must pass before releasing.
