/* eslint-disable react-refresh/only-export-components */

import { createReactBlockSpec } from '@blocknote/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

type MathBlockRenderProps = {
  latex: string
  isEditable: boolean
  updateLatex: (latex: string) => void
}

function MathBlockRender({ latex, isEditable, updateLatex }: MathBlockRenderProps) {
  const [isEditing, setIsEditing] = useState(!latex)
  const [value, setValue] = useState(latex)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isEditing && previewRef.current && latex) {
      try {
        katex.render(latex, previewRef.current, {
          displayMode: true,
          throwOnError: false,
          trust: true,
        })
      } catch {
        previewRef.current.textContent = 'Invalid LaTeX'
      }
    }
  }, [isEditing, latex])

  const save = useCallback(() => {
    updateLatex(value)

    if (value.trim()) {
      setIsEditing(false)
    }
  }, [updateLatex, value])

  if (isEditing) {
    return (
      <div className="math-block-editor" style={editorStyles.wrapper}>
        <div style={editorStyles.toolbar}>
          <span>MathQuill · Formula matematica</span>
          <button onClick={save} style={editorStyles.doneButton} type="button">
            Listo
          </button>
        </div>

        <div
          style={editorStyles.editorCanvas}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              save()
            }

            if (event.key === 'Escape') {
              save()
            }
          }}
        >
          <textarea
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
            }}
            placeholder="Escribe la formula en LaTeX"
            spellCheck={false}
            rows={4}
            style={editorStyles.textarea}
          />
        </div>

        {value.trim() && (
          <div style={editorStyles.sourcePreview}>
            <code>{value}</code>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={previewRef}
        className="math-block-preview"
      style={{
        ...editorStyles.preview,
        cursor: isEditable ? 'pointer' : 'default',
      }}
      onClick={() => {
        if (!isEditable) {
          return
        }

        setIsEditing(true)
      }}
      onMouseEnter={(event) => {
        if (!isEditable) {
          return
        }

        event.currentTarget.style.background = '#f1f5f9'
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = 'transparent'
      }}
    />
  )
}

const editorStyles = {
  wrapper: {
    border: '1px solid rgba(15, 23, 42, 0.1)',
    borderRadius: '1rem',
    overflow: 'hidden',
  },
  toolbar: {
    padding: '4px 10px',
    background: '#f8fafc',
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doneButton: {
    background: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '999px',
    padding: '4px 10px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  editorCanvas: {
    padding: '12px',
    background: '#ffffff',
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    fontSize: '18px',
    lineHeight: 1.5,
    border: '1px solid rgba(15, 23, 42, 0.1)',
    borderRadius: '0.75rem',
    padding: '8px 12px',
    resize: 'vertical' as const,
    outline: 'none',
    fontFamily: 'SFMono-Regular, SF Mono, Consolas, monospace',
  },
  sourcePreview: {
    padding: '8px 12px',
    borderTop: '1px solid rgba(15, 23, 42, 0.1)',
    background: '#f8fafc',
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#64748b',
    overflow: 'auto',
  },
  preview: {
    padding: '16px',
    textAlign: 'center' as const,
    borderRadius: '1rem',
    transition: 'background 0.15s ease',
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}

export const MathBlock = createReactBlockSpec(
  {
    type: 'math',
    propSchema: {
      latex: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => (
      <MathBlockRender
        latex={block.props.latex}
        isEditable={editor.isEditable}
        updateLatex={(latex) => {
          editor.updateBlock(block, {
            props: { latex },
          })
        }}
      />
    ),
  },
)
