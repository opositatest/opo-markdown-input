import { LinkToolbar, type LinkToolbarProps } from '@blocknote/react'
import type { MouseEvent, ReactElement } from 'react'

import { FloatingPortal } from './floating-portal'

// Same as BlockNote's default LinkToolbar (the "Editar/Abrir/Eliminar"
// hover bar, and the "Editar enlace" popover it opens), wrapped so it
// escapes ancestor `overflow`/stacking issues - see `floating-portal.tsx`.
export function AppLinkToolbar(props: LinkToolbarProps): ReactElement {
  function handleMouseEnter(): void {
    props.setToolbarPositionFrozen?.(true)
  }

  function handleMouseLeave(event: MouseEvent<HTMLDivElement>): void {
    if (event.currentTarget.querySelector('[aria-expanded="true"]')) {
      return
    }

    props.setToolbarPositionFrozen?.(false)
    props.setToolbarOpen?.(false)
  }

  return (
    <FloatingPortal>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <LinkToolbar {...props} />
      </div>
    </FloatingPortal>
  )
}
