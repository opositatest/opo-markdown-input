import type { DefaultReactSuggestionItem, SuggestionMenuProps } from '@blocknote/react'
import type { ReactElement } from 'react'

interface GroupedItems {
  group: string
  items: DefaultReactSuggestionItem[]
}

function groupItems(items: DefaultReactSuggestionItem[]): GroupedItems[] {
  const groups: GroupedItems[] = []
  let currentGroup: GroupedItems | null = null

  for (const item of items) {
    const group = item.group || 'Other'

    if (!currentGroup || currentGroup.group !== group) {
      currentGroup = { group, items: [] }
      groups.push(currentGroup)
    }

    currentGroup.items.push(item)
  }

  return groups
}

export function CustomSuggestionMenu(
  props: SuggestionMenuProps<DefaultReactSuggestionItem>,
): ReactElement {
  const groupedItems = groupItems(props.items)
  let globalIndex = 0

  return (
    <div className="bn-suggestion-menu custom-suggestion-menu">
      {groupedItems.map((group) => (
        <div key={group.group} className="suggestion-group">
          <div className="suggestion-group-header">{group.group}</div>
          {group.items.map((item) => {
            const currentIndex = globalIndex++
            return (
              <div
                key={item.title}
                className={`bn-suggestion-menu-item ${
                  props.selectedIndex === currentIndex ? 'bn-suggestion-menu-item-selected' : ''
                }`}
                onClick={() => {
                  props.onItemClick?.(item)
                }}
              >
                <div className="bn-suggestion-menu-item-title">{item.title}</div>
                {item.subtext && (
                  <div className="bn-suggestion-menu-item-subtext">{item.subtext}</div>
                )}
                {item.badge && <div className="bn-suggestion-menu-item-badge">{item.badge}</div>}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
