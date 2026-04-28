import { SuggestionMenuController } from '@blocknote/react'
import type { ReactElement } from 'react'

import type { TAppBlockNoteSuggestionMenuProps } from './app-block-note-suggestion-menu.types'

export function AppBlockNoteSuggestionMenu(
  props: TAppBlockNoteSuggestionMenuProps,
): ReactElement {
  return <SuggestionMenuController {...props} />
}
