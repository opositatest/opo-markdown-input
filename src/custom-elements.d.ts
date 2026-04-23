import type * as React from 'react'
import type { DraftToApiEditorElement } from './register-web-component'

type DraftToApiEditorProps = React.DetailedHTMLProps<
  React.HTMLAttributes<DraftToApiEditorElement>,
  DraftToApiEditorElement
> & {
  name?: string
  value?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'draft-to-api-editor': DraftToApiEditorProps
    }
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'draft-to-api-editor': DraftToApiEditorProps
    }
  }
}

export {}
