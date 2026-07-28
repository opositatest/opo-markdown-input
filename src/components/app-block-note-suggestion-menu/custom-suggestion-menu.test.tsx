import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { CustomSuggestionMenu } from './custom-suggestion-menu'
import type { DefaultReactSuggestionItem } from '@blocknote/react'

function createItem(overrides: Partial<DefaultReactSuggestionItem>): DefaultReactSuggestionItem {
  return {
    title: 'Test Item',
    subtext: '',
    group: 'Test',
    aliases: [],
    onItemClick: vi.fn(),
    ...overrides,
  }
}

const DEFAULT_PROPS = {
  loadingState: 'loaded' as const,
  columns: 1,
}

describe('CustomSuggestionMenu', () => {
  it('renders nothing when items is empty', () => {
    const { container } = render(
      <CustomSuggestionMenu items={[]} selectedIndex={0} onItemClick={vi.fn()} {...DEFAULT_PROPS} />,
    )
    expect(container.querySelector('.custom-suggestion-menu')).not.toBeNull()
    expect(container.querySelectorAll('.suggestion-group')).toHaveLength(0)
  })

  it('renders items grouped by group field', () => {
    const items = [
      createItem({ title: 'Heading 1', group: 'Headings' }),
      createItem({ title: 'Heading 2', group: 'Headings' }),
      createItem({ title: 'Paragraph', group: 'Basic blocks' }),
    ]

    const { container } = render(
      <CustomSuggestionMenu items={items} selectedIndex={-1} onItemClick={vi.fn()} {...DEFAULT_PROPS} />,
    )

    const groups = container.querySelectorAll('.suggestion-group')
    expect(groups).toHaveLength(2)
  })

  it('renders group headers', () => {
    const items = [
      createItem({ title: 'Heading 1', group: 'Headings' }),
      createItem({ title: 'Paragraph', group: 'Basic blocks' }),
    ]

    render(
      <CustomSuggestionMenu items={items} selectedIndex={-1} onItemClick={vi.fn()} {...DEFAULT_PROPS} />,
    )

    expect(screen.getByText('Headings')).toBeDefined()
    expect(screen.getByText('Basic blocks')).toBeDefined()
  })

  it('renders item titles', () => {
    const items = [
      createItem({ title: 'Heading 1', group: 'Headings' }),
      createItem({ title: 'Paragraph', group: 'Basic blocks' }),
    ]

    render(
      <CustomSuggestionMenu items={items} selectedIndex={-1} onItemClick={vi.fn()} {...DEFAULT_PROPS} />,
    )

    expect(screen.getByText('Heading 1')).toBeDefined()
    expect(screen.getByText('Paragraph')).toBeDefined()
  })

  it('renders subtext when provided', () => {
    const items = [createItem({ title: 'Heading 1', subtext: 'Top-level heading', group: 'Headings' })]

    render(
      <CustomSuggestionMenu items={items} selectedIndex={-1} onItemClick={vi.fn()} {...DEFAULT_PROPS} />,
    )

    expect(screen.getByText('Top-level heading')).toBeDefined()
  })

  it('does not render subtext element when empty', () => {
    const { container } = render(
      <CustomSuggestionMenu
        items={[createItem({ title: 'Item', subtext: '', group: 'G' })]}
        selectedIndex={-1}
        onItemClick={vi.fn()}
        {...DEFAULT_PROPS}
      />,
    )
    expect(container.querySelector('.bn-suggestion-menu-item-subtext')).toBeNull()
  })

  it('renders badge when provided', () => {
    const items = [createItem({ title: 'Item', badge: 'NEW', group: 'G' })]

    render(
      <CustomSuggestionMenu items={items} selectedIndex={-1} onItemClick={vi.fn()} {...DEFAULT_PROPS} />,
    )

    expect(screen.getByText('NEW')).toBeDefined()
  })

  it('calls onItemClick with the correct item', () => {
    const onItemClick = vi.fn()
    const items = [
      createItem({ title: 'Heading 1', group: 'Headings' }),
      createItem({ title: 'Paragraph', group: 'Basic blocks' }),
    ]

    render(
      <CustomSuggestionMenu
        items={items}
        selectedIndex={-1}
        onItemClick={onItemClick}
        {...DEFAULT_PROPS}
      />,
    )

    fireEvent.click(screen.getByText('Paragraph'))
    expect(onItemClick).toHaveBeenCalledWith(items[1])
  })

  it('applies selected class to the correct item', () => {
    const items = [
      createItem({ title: 'Heading 1', group: 'Headings' }),
      createItem({ title: 'Paragraph', group: 'Headings' }),
    ]

    const { container } = render(
      <CustomSuggestionMenu items={items} selectedIndex={1} onItemClick={vi.fn()} {...DEFAULT_PROPS} />,
    )

    const menuItems = container.querySelectorAll('.bn-suggestion-menu-item')
    expect(menuItems[0].className).not.toContain('bn-suggestion-menu-item-selected')
    expect(menuItems[1].className).toContain('bn-suggestion-menu-item-selected')
  })

  it('handles items with empty group as "Other"', () => {
    const items = [createItem({ title: 'Item', group: '' })]

    render(
      <CustomSuggestionMenu items={items} selectedIndex={-1} onItemClick={vi.fn()} {...DEFAULT_PROPS} />,
    )

    expect(screen.getByText('Other')).toBeDefined()
  })

  it('groups consecutive items with same group together', () => {
    const items = [
      createItem({ title: 'A', group: 'G1' }),
      createItem({ title: 'B', group: 'G2' }),
      createItem({ title: 'C', group: 'G1' }),
    ]

    const { container } = render(
      <CustomSuggestionMenu items={items} selectedIndex={-1} onItemClick={vi.fn()} {...DEFAULT_PROPS} />,
    )

    const groups = container.querySelectorAll('.suggestion-group')
    expect(groups).toHaveLength(3)
  })
})
