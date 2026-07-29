import {
  FormattingToolbar,
  getFormattingToolbarItems,
  type FormattingToolbarProps,
} from '@blocknote/react'
import type { ReactElement } from 'react'

import { AppCreateLinkButton } from './app-create-link-button'

const EXCLUDED_ITEM_KEYS = new Set(['createLinkButton', 'addCommentButton', 'addTiptapCommentButton'])

export function AppFormattingToolbar(props: FormattingToolbarProps): ReactElement {
  const items = getFormattingToolbarItems(props.blockTypeSelectItems).filter(
    (item) => !EXCLUDED_ITEM_KEYS.has(String(item.key)),
  )

  return (
    <FormattingToolbar>
      {items}
      <AppCreateLinkButton key="appCreateLinkButton" />
    </FormattingToolbar>
  )
}
