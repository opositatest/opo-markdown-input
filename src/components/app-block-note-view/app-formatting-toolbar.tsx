import {
  FormattingToolbar,
  getFormattingToolbarItems,
  type FormattingToolbarProps,
} from '@blocknote/react'
import type { ReactElement } from 'react'

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
        <AppCreateLinkButton key="appCreateLinkButton" />
      </FormattingToolbar>
    </FloatingPortal>
  )
}
