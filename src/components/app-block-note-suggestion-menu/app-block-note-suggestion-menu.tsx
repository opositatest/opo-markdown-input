import { SuggestionMenuController } from '@blocknote/react'
import type { ReactElement } from 'react'

import { CustomSuggestionMenu } from './custom-suggestion-menu'
import type { TAppBlockNoteSuggestionMenuProps } from './app-block-note-suggestion-menu.types'

import './custom-suggestion-menu.css'

export function AppBlockNoteSuggestionMenu(
  props: TAppBlockNoteSuggestionMenuProps,
): ReactElement {
  return (
    <SuggestionMenuController
      {...props}
      suggestionMenuComponent={CustomSuggestionMenu}
    />
  )
}
