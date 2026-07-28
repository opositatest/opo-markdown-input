import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import type { ReactElement } from 'react'

import type { TAppBlockNoteViewProps } from './app-block-note-view.types'

export function AppBlockNoteView({
  formattingToolbar = true,
  linkToolbar = true,
  ...props
}: TAppBlockNoteViewProps): ReactElement {
  return (
    <BlockNoteView
      {...props}
      theme="light"
      formattingToolbar={formattingToolbar}
      linkToolbar={linkToolbar}
      slashMenu={false}
      sideMenu={false}
      filePanel={true}
      tableHandles={false}
      emojiPicker={false}
    />
  )
}
