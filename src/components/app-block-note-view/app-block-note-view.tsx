import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { FormattingToolbarController, LinkToolbarController } from '@blocknote/react'
import type { ReactElement } from 'react'

import { AppFormattingToolbar } from './app-formatting-toolbar'
import { AppLinkToolbar } from './app-link-toolbar'
import type { TAppBlockNoteViewProps } from './app-block-note-view.types'

import './app-block-note-view.css'

// BlockNote's formatting/link toolbars (and the popovers they open, e.g.
// "Editar enlace") mount inline wherever their controller sits in the React
// tree by default. `strategy: 'fixed'` positions floating-ui's own element
// relative to the viewport (handles simple `overflow: hidden` ancestors),
// and `AppFormattingToolbar`/`AppLinkToolbar` additionally wrap their
// content in `FloatingPortal`, which moves the real DOM to `document.body`
// - the only thing that also survives a host ancestor with `transform`,
// `filter`, `backdrop-filter`, `perspective`, or `will-change`, any of
// which creates a containing block that traps a merely-fixed element. See
// `floating-portal.tsx` for why both layers exist.
const FLOATING_UI_OPTIONS = {
  useFloatingOptions: { strategy: 'fixed' as const },
}

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
      linkToolbar={false}
      slashMenu={false}
      sideMenu={false}
      filePanel={true}
      tableHandles={true}
      emojiPicker={false}
    >
      {formattingToolbar && (
        <FormattingToolbarController
          formattingToolbar={AppFormattingToolbar}
          floatingUIOptions={FLOATING_UI_OPTIONS}
        />
      )}
      {linkToolbar && (
        <LinkToolbarController linkToolbar={AppLinkToolbar} floatingUIOptions={FLOATING_UI_OPTIONS} />
      )}
      {children}
    </BlockNoteView>
  )
}
