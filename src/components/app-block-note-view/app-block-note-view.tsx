import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import type { ReactElement } from 'react'

import type { TAppBlockNoteViewProps } from './app-block-note-view.types'

export function AppBlockNoteView(props: TAppBlockNoteViewProps): ReactElement {
  return (
    <BlockNoteView
      {...props}
      theme="light"
      formattingToolbar={false}
      linkToolbar={false}
      slashMenu={false}
      sideMenu={false}
      filePanel={false}
      tableHandles={false}
      emojiPicker={false}
    />
  )
}
