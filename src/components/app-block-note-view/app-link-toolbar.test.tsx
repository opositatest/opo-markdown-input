import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AppLinkToolbar } from './app-link-toolbar'

vi.mock('@blocknote/react', () => ({
  LinkToolbar: ({ text }: { text: string }) => (
    <div role="toolbar">{text === 'Open' && <button aria-expanded="true" />}</div>
  ),
}))

vi.mock('./floating-portal', () => ({
  FloatingPortal: ({ children }: { children: React.ReactNode }) => children,
}))

function createProps() {
  return {
    url: 'https://example.com',
    text: 'Example',
    range: { from: 1, to: 2 },
    setToolbarOpen: vi.fn(),
    setToolbarPositionFrozen: vi.fn(),
  }
}

describe('AppLinkToolbar', () => {
  it('keeps the toolbar open while the pointer is interacting with it', () => {
    const props = createProps()
    const { getByRole } = render(<AppLinkToolbar {...props} />)
    const wrapper = getByRole('toolbar').parentElement!

    fireEvent.mouseEnter(wrapper)

    expect(props.setToolbarPositionFrozen).toHaveBeenCalledWith(true)
  })

  it('closes the toolbar after the pointer leaves it', () => {
    const props = createProps()
    const { getByRole } = render(<AppLinkToolbar {...props} />)
    const wrapper = getByRole('toolbar').parentElement!

    fireEvent.mouseLeave(wrapper)

    expect(props.setToolbarPositionFrozen).toHaveBeenCalledWith(false)
    expect(props.setToolbarOpen).toHaveBeenCalledWith(false)
  })

  it('stays open while the edit-link popover is expanded', () => {
    const props = { ...createProps(), text: 'Open' }
    const { getByRole } = render(<AppLinkToolbar {...props} />)
    const wrapper = getByRole('toolbar').parentElement!

    fireEvent.mouseLeave(wrapper)

    expect(props.setToolbarPositionFrozen).not.toHaveBeenCalled()
    expect(props.setToolbarOpen).not.toHaveBeenCalled()
  })
})
