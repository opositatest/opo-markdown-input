import { LinkToolbar, type LinkToolbarProps } from '@blocknote/react'
import type { ReactElement } from 'react'

import { FloatingPortal } from './floating-portal'

// Same as BlockNote's default LinkToolbar (the "Editar/Abrir/Eliminar"
// hover bar, and the "Editar enlace" popover it opens), wrapped so it
// escapes ancestor `overflow`/stacking issues - see `floating-portal.tsx`.
export function AppLinkToolbar(props: LinkToolbarProps): ReactElement {
  return (
    <FloatingPortal>
      <LinkToolbar {...props} />
    </FloatingPortal>
  )
}
