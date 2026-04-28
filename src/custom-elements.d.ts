import type * as React from 'react'
import type { MarkdownTextEditorElement } from './markdown-text-editor/markdown-text-editor-element'

type MarkdownTextEditorProps = React.DetailedHTMLProps<
  React.HTMLAttributes<MarkdownTextEditorElement>,
  MarkdownTextEditorElement
> & {
  name?: string
  value?: string
  placeholder?: string
  width?: string
  height?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'markdown-text-editor': MarkdownTextEditorProps
    }
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'markdown-text-editor': MarkdownTextEditorProps
    }
  }
}

export {}
