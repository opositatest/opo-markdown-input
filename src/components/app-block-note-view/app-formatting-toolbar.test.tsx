import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AppFormattingToolbar } from './app-formatting-toolbar'

/**
 * `getFormattingToolbarItems` is mocked with the upstream item keys this
 * package cares about, because the bug being guarded against is *key drift*:
 * `AppFormattingToolbar` filters by `item.key`, so an upstream rename would
 * silently re-enable an item (no error, it just reappears). `boldStyleButton`
 * stands in for the items that must survive the filter.
 */
vi.mock('@blocknote/react', () => ({
  FormattingToolbar: ({ children }: { children?: ReactNode }) => (
    <div role="toolbar">{children}</div>
  ),
  getFormattingToolbarItems: (): ReactElement[] => [
    <button key="boldStyleButton" data-testid="bold-style-button" />,
    <button key="nestBlockButton" data-testid="nest-block-button" />,
    <button key="unnestBlockButton" data-testid="unnest-block-button" />,
    <button key="colorStyleButton" data-testid="color-style-button" />,
  ],
}))

vi.mock('./floating-portal', () => ({
  FloatingPortal: ({ children }: { children: ReactNode }) => children,
}))

vi.mock('./app-clear-formatting-button', () => ({
  AppClearFormattingButton: () => <button data-testid="clear-formatting-button" />,
}))

vi.mock('./app-create-link-button', () => ({
  AppCreateLinkButton: () => <button data-testid="create-link-button" />,
}))

describe('AppFormattingToolbar', () => {
  // Nesting a block is not part of the supported surface (README "Tab key").
  // Swallowing `Tab` only killed the shortcut; clicking these two buttons
  // still indented the block, so they must stay out of the toolbar.
  it('drops the nest and un-nest items', () => {
    const { queryByTestId } = render(<AppFormattingToolbar />)

    expect(queryByTestId('nest-block-button')).toBeNull()
    expect(queryByTestId('unnest-block-button')).toBeNull()
  })

  it('keeps the other items and the package buttons', () => {
    const { queryByTestId } = render(<AppFormattingToolbar />)

    expect(queryByTestId('bold-style-button')).not.toBeNull()
    expect(queryByTestId('clear-formatting-button')).not.toBeNull()
    expect(queryByTestId('create-link-button')).not.toBeNull()
    expect(queryByTestId('color-style-button')).toBeNull()
  })

  it('forwards the block type select items to the upstream item list', () => {
    const { getByRole } = render(<AppFormattingToolbar blockTypeSelectItems={[]} />)

    expect(getByRole('toolbar')).not.toBeNull()
  })
})
