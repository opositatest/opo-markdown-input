import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { FormattingToolbarController } from '@blocknote/react'
import type { ReactElement } from 'react'

import { AppFormattingToolbar } from './app-formatting-toolbar'
import type { TAppBlockNoteViewProps } from './app-block-note-view.types'

export function AppBlockNoteView({
  children,
  formattingToolbar = true,
  linkToolbar = true,
  ...props
}: TAppBlockNoteViewProps): ReactElement {
  return (
    <BlockNoteView
      {...props}
      theme="light"
      formattingToolbar={false}
      linkToolbar={linkToolbar}
      slashMenu={false}
      sideMenu={false}
      filePanel={true}
      tableHandles={false}
      emojiPicker={false}
    >
      {formattingToolbar && (
        <FormattingToolbarController formattingToolbar={AppFormattingToolbar} />
      )}
      {children}
    </BlockNoteView>
  )
}
