import {
  FormattingToolbar,
  getFormattingToolbarItems,
  type FormattingToolbarProps,
} from '@blocknote/react'
import type { ReactElement } from 'react'

import { AppClearFormattingButton } from './app-clear-formatting-button'
import { AppCreateLinkButton } from './app-create-link-button'
import { FloatingPortal } from './floating-portal'

// `nestBlockButton`/`unnestBlockButton` are excluded on purpose: indented and
// nested blocks are not part of this package's supported surface (see the
// README's "Tab key" section). Swallowing `Tab` (commit `5db85a7`) only
// removes the *shortcut*; the two toolbar buttons were left behind and still
// nested/un-nested a block with one click, which is why the option kept
// showing up in the editor's options after that fix.
const EXCLUDED_ITEM_KEYS = new Set([
  'nestBlockButton',
  'unnestBlockButton',
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
