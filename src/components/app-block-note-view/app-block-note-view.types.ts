import type { BlockNoteView } from '@blocknote/mantine'
import type { ComponentProps } from 'react'

export type TAppBlockNoteViewProps = Pick<
  ComponentProps<typeof BlockNoteView>,
  'children' | 'className' | 'editable' | 'editor' | 'onChange'
>
