import {
  formatKeyboardShortcut,
  isTableCellSelection,
  type BlockNoteEditor,
  type BlockSchema,
  type StyleSchema,
} from '@blocknote/core'
import { FormattingToolbarExtension, ShowSelectionExtension } from '@blocknote/core/extensions'
import {
  EditLinkMenuItems,
  useBlockNoteEditor,
  useComponentsContext,
  useDictionary,
  useEditorState,
  useExtension,
} from '@blocknote/react'
import { useEffect, useState, type ReactElement } from 'react'
import { RiLink } from 'react-icons/ri'

function checkLinkInSchema(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: BlockNoteEditor<BlockSchema, any, StyleSchema>,
): editor is BlockNoteEditor<
  BlockSchema,
  {
    link: {
      type: 'link'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      propSchema: any
      content: 'styled'
    }
  },
  StyleSchema
> {
  return (
    'link' in editor.schema.inlineContentSchema &&
    editor.schema.inlineContentSchema['link'] === 'link'
  )
}

// Same as BlockNote's default CreateLinkButton, but marks the icon as active
// (isSelected) when the selection is already inside a link, matching the
// active-state feedback the other formatting buttons already provide.
export function AppCreateLinkButton(): ReactElement | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editor = useBlockNoteEditor<any, any, any>()
  const Components = useComponentsContext()!
  const dict = useDictionary()

  const formattingToolbar = useExtension(FormattingToolbarExtension)
  const { showSelection } = useExtension(ShowSelectionExtension)

  const [showPopover, setShowPopover] = useState(false)
  useEffect(() => {
    showSelection(showPopover, 'createLinkButton')
    return () => showSelection(false, 'createLinkButton')
  }, [showPopover, showSelection])

  const state = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (
        !editor.isEditable ||
        !checkLinkInSchema(editor) ||
        isTableCellSelection(editor.prosemirrorState.selection) ||
        !(editor.getSelection()?.blocks || [editor.getTextCursorPosition().block]).find(
          (block) => block.content !== undefined,
        )
      ) {
        return undefined
      }

      return {
        url: editor.getSelectedLinkUrl(),
        text: editor.getSelectedText(),
        range: {
          from: editor.prosemirrorState.selection.from,
          to: editor.prosemirrorState.selection.to,
        },
      }
    },
  })
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowPopover(false)
  }, [state])

  useEffect(() => {
    const callback = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        setShowPopover(true)
        event.preventDefault()
      }
    }

    const domElement = editor.domElement
    domElement?.addEventListener('keydown', callback)

    return () => {
      domElement?.removeEventListener('keydown', callback)
    }
  }, [editor.domElement])

  if (state === undefined) {
    return null
  }

  return (
    <Components.Generic.Popover.Root
      open={showPopover}
      onOpenChange={setShowPopover}
    >
      <Components.Generic.Popover.Trigger>
        <Components.FormattingToolbar.Button
          className="bn-button"
          data-test="createLink"
          label={dict.formatting_toolbar.link.tooltip}
          mainTooltip={dict.formatting_toolbar.link.tooltip}
          secondaryTooltip={formatKeyboardShortcut(
            dict.formatting_toolbar.link.secondary_tooltip,
            dict.generic.ctrl_shortcut,
          )}
          icon={<RiLink />}
          isSelected={!!state.url}
          onClick={() => setShowPopover((open) => !open)}
        />
      </Components.Generic.Popover.Trigger>
      <Components.Generic.Popover.Content
        className="bn-popover-content bn-form-popover"
        variant="form-popover"
      >
        <EditLinkMenuItems
          url={state.url || ''}
          text={state.text}
          range={state.range}
          showTextField={false}
          setToolbarOpen={(open) => formattingToolbar.store.setState(open)}
        />
      </Components.Generic.Popover.Content>
    </Components.Generic.Popover.Root>
  )
}
