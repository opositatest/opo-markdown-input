# @opositatest/markdown-text-editor

[![Lint](https://github.com/opositatest/opo-markdown-input/actions/workflows/lint.yml/badge.svg)](https://github.com/opositatest/opo-markdown-input/actions/workflows/lint.yml)
[![TypeScript check](https://github.com/opositatest/opo-markdown-input/actions/workflows/typecheck.yml/badge.svg)](https://github.com/opositatest/opo-markdown-input/actions/workflows/typecheck.yml)
[![npm version](https://img.shields.io/npm/v/%40opositatest%2Fmarkdown-text-editor)](https://www.npmjs.com/package/@opositatest/markdown-text-editor)
[![CDN](https://img.shields.io/badge/CDN-jsDelivr-ff5627)](https://www.jsdelivr.com/package/npm/@opositatest/markdown-text-editor)
[![TypeScript](https://img.shields.io/badge/TypeScript-supported-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![ESM](https://img.shields.io/badge/ESM-native-f7df1e?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![Web Component](https://img.shields.io/badge/Web%20Component-custom%20element-7c3aed)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)

Rich-text editor that serializes content as Markdown. Ships as a self-contained Web Component and as a React component.

## Web Component

Load via CDN (no build step required):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@opositatest/markdown-text-editor/dist/editor.css" />
<script type="module" src="https://cdn.jsdelivr.net/npm/@opositatest/markdown-text-editor/dist/editor.js"></script>
```

### Usage

```html
<form>
  <markdown-text-editor
    name="body"
    value="Initial content"
    placeholder="Write here…"
    width="100%"
    height="320px"
    required
  ></markdown-text-editor>
</form>
```

### Attributes

| Attribute     | Type    | Description                                      |
|---------------|---------|--------------------------------------------------|
| `name`        | string  | Field name for form submission                   |
| `value`       | string  | Initial Markdown value                           |
| `placeholder` | string  | Placeholder text shown when empty                |
| `width`       | string  | CSS width for the editor container               |
| `height`      | string  | CSS height for the editor container              |
| `disabled`    | boolean | Disables the editor                              |
| `readonly`    | boolean | Makes the editor read-only                       |
| `required`    | boolean | Participates in native form validation           |

`width` and `height` accept any valid CSS size, such as `320px`, `40rem`, or `100%`.

### Properties

| Property            | Type    | Description                         |
|---------------------|---------|-------------------------------------|
| `element.value`     | string  | Get or set Markdown content         |
| `element.width`     | string  | Get or set CSS width                |
| `element.height`    | string  | Get or set CSS height               |
| `element.disabled`  | boolean | Get or set disabled state           |
| `element.readOnly`  | boolean | Get or set read-only state          |

### Methods

| Method                    | Description                        |
|---------------------------|------------------------------------|
| `focus()`                 | Focus the editor                   |
| `getMarkdown()`           | Returns current content as Markdown |
| `setMarkdown(value)`      | Replaces editor content            |

### Events

| Event   | Fires when                                      |
|---------|-------------------------------------------------|
| `input` | On every content change (keystroke)             |
| `change`| On blur if value changed since focus            |
| `ready` | Once the editor has initialized                 |

### Form integration

`required` participates in native browser form validation via `ElementInternals` (with a hidden-input fallback for browsers that don't support it). The field value is submitted with the form using the `name` attribute.

---

## React Component

```bash
npm install @opositatest/markdown-text-editor
```

```tsx
import { MarkdownTextEditor } from '@opositatest/markdown-text-editor'
import '@opositatest/markdown-text-editor/style'

<MarkdownTextEditor defaultValue="Hello" width="100%" height="320px" />
```

### Props

| Prop           | Type                                        | Description                                      |
|----------------|---------------------------------------------|--------------------------------------------------|
| `value`        | `string`                                    | Controlled Markdown value                        |
| `defaultValue` | `string`                                    | Uncontrolled initial value                       |
| `onChange`     | `(value: string) => void`                   | Called on every content change                   |
| `onReady`      | `(handle: MarkdownTextEditorHandle) => void`| Called once editor has initialized               |
| `placeholder`  | `string`                                    | Placeholder text shown when empty                |
| `width`        | `string`                                    | CSS width for the editor container               |
| `height`       | `string`                                    | CSS height for the editor container              |
| `disabled`     | `boolean`                                   | Disables the editor                              |
| `readonly`     | `boolean`                                   | Makes the editor read-only                       |
| `className`    | `string`                                    | Additional CSS class on the editor container     |

`width` and `height` accept any valid CSS size, such as `320px`, `40rem`, or `100%`.

### Imperative handle (via ref)

```tsx
import { useRef } from 'react'
import { MarkdownTextEditor, type TMarkdownTextEditorHandle } from '@opositatest/markdown-text-editor'

const ref = useRef<TMarkdownTextEditorHandle>(null)

<MarkdownTextEditor ref={ref} defaultValue="Hello" onChange={setValue} />
```

| Method                | Description                         |
|-----------------------|-------------------------------------|
| `ref.focus()`         | Focus the editor                    |
| `ref.getMarkdown()`   | Returns current content as Markdown |
| `ref.setMarkdown(v)`  | Replaces editor content             |

---

## Package exports

| Export                                   | Description                        |
|------------------------------------------|------------------------------------|
| `@opositatest/markdown-text-editor`      | React component + types            |
| `@opositatest/markdown-text-editor/input`| Self-contained Web Component bundle |
| `@opositatest/markdown-text-editor/style`| CSS stylesheet                     |

## Browser support

Requires browsers with support for [Custom Elements v1](https://caniuse.com/custom-elementsv1) and [ElementInternals](https://caniuse.com/mdn-api_elementinternals). All modern browsers (Chrome 77+, Firefox 98+, Safari 16.4+) are supported.

## Peer dependencies (React component only)

`react >= 19`, `react-dom >= 19`
