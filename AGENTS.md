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
npm run release                # release-it: lint → typecheck → build:package → git tag + GitHub release
```

No test suite exists.

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

## Verification

Before committing, run:
```bash
npm run lint && npm run typecheck
```

No tests to run.

## Release

`release-it` handles releases. Pre-init hooks run `lint` and `typecheck`; post-bump runs `build:package`. The web component build must pass before releasing.
