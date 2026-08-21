import {
  FormattingToolbar,
  getFormattingToolbarItems,
  type FormattingToolbarProps,
} from '@blocknote/react'
import type { ReactElement } from 'react'

import { AppClearFormattingButton } from './app-clear-formatting-button'
import { AppCreateLinkButton } from './app-create-link-button'
import { FloatingPortal } from './floating-portal'

const EXCLUDED_ITEM_KEYS = new Set([
  'createLinkButton',
  'addCommentButton',
  'addTiptapCommentButton',
  'colorStyleButton',
])

export function AppFormattingToolbar(props: FormattingToolbarProps): ReactElement {
  const items = getFormattingToolbarItems(props.blockTypeSelectItems).filter(
    (item) => !EXCLUDED_ITEM_KEYS.has(String(item.key)),
  )

  return (
    <FloatingPortal>
      <FormattingToolbar>
        {items}
        <AppClearFormattingButton key="appClearFormattingButton" />
        <AppCreateLinkButton key="appCreateLinkButton" />
      </FormattingToolbar>
    </FloatingPortal>
  )
}
