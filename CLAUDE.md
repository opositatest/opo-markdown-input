# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                    # Start dev server (Vite)
npm run build                  # Type-check + production build (React app)
npm run build:web-component    # Build distributable web component (editor.js + editor.css)
npm run lint                   # ESLint
```

No test suite is configured.

## Architecture

This is a spike/prototype for a rich-text editor that ships as a **form-associated custom element** (`<draft-to-api-editor>`). The editor serializes its content as Markdown.

### Two build targets

1. **React app** (`vite.config.ts` → `src/main.tsx`): dev harness that exercises the web component in a realistic form context (submit, reset, programmatic API).
2. **Web component bundle** (`vite.web-component.config.ts` → `src/web-component-entry.ts`): self-contained `editor.js` + `editor.css` with no external dependencies, intended for embedding in non-React hosts.

### Layer stack

```
<draft-to-api-editor>          src/register-web-component.tsx
  └── DraftToApiEditorElement  HTMLElement subclass, form-associated
        └── EditorField        src/editor/EditorField.tsx
              ├── BlockNoteView (@blocknote/mantine)
              └── editorSchema  src/editor/editor-schema.ts
                    └── MathBlock  src/editor/MathBlock.tsx (custom block)
```

**`DraftToApiEditorElement`** bridges the DOM/form world to React:
- Uses `ElementInternals` (with hidden-input fallback) for native form participation (submit, reset, validation).
- Mounts a React root into a `div.draft-to-api-editor__mount` child.
- Exposes `focus()`, `getMarkdown()`, `setMarkdown(value)` as JS API.
- Fires `input` (on every keystroke), `change` (on blur if value changed), and `ready` (once editor is initialized) events.

**`EditorField`** is the React component wrapping BlockNote:
- Accepts `value` (controlled), `defaultValue` (uncontrolled), `onChange`, `disabled`, `readonly`, `placeholder`.
- Exposes an imperative handle (`EditorFieldHandle`) via `forwardRef` for `focus`, `getMarkdown`, `setMarkdown`.
- Uses `applyingExternalValueRef` guard to suppress `onChange` callbacks that would fire during programmatic value updates.

**`editor-field-utils.ts`** handles Markdown ↔ BlockNote block conversion:
- Math blocks (`$$…$$`) are split out before passing text to BlockNote's parser, then re-serialized as `$$\n…\n$$` segments, because BlockNote's Markdown parser does not handle display math natively.

**`MathBlock`** is a custom BlockNote block spec that renders LaTeX via KaTeX. Clicking the rendered preview switches to a textarea edit mode.

### Key design constraints

- The web component build must be fully self-contained (no `import` at runtime) — `inlineDynamicImports: true` and `cssCodeSplit: false` enforce this.
- `process.env.NODE_ENV` is statically replaced in the web component build to avoid runtime errors in non-Node environments.
- BlockNote's slash menu is replaced with a custom filtered menu that adds the math block entry.
