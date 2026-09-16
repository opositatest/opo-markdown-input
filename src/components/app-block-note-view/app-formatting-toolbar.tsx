import {
  FormattingToolbar,
  getFormattingToolbarItems,
  type FormattingToolbarProps,
} from '@blocknote/react'
import type { ReactElement } from 'react'

import { AppClearFormattingButton } from './app-clear-formatting-button'
import { AppCreateLinkButton } from './app-create-link-button'
import { FloatingPortal } from './floating-portal'

// `nestBlockButton`/`unnestBlockButton` are excluded on purpose: they nest
// whatever block is selected, and only a list item nested under another list
// item survives a Markdown round trip (see the README's "Tab key" section and
// `src/editor/no-tab-indentation.ts`, which is the one place nesting is still
// allowed). Swallowing `Tab` (commit `5db85a7`) only removed the *shortcut*;
// these two buttons were left behind and still nested a paragraph with one
// click, which is why the option kept showing up in the editor's options.
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
