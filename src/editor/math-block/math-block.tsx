import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactElement } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

import { mathBlockStyles } from './math-block.styles'
import type { TMathBlockProps } from './math-block.types'

export function MathBlock({ latex, isEditable, updateLatex }: TMathBlockProps): ReactElement {
  const [isEditing, setIsEditing] = useState(!latex)
  const [isHovered, setIsHovered] = useState(false)
  const [value, setValue] = useState(latex)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEditing || !previewRef.current) {
      return
    }

    if (!latex.trim()) {
      previewRef.current.textContent = ''
      return
    }

    try {
      katex.render(latex, previewRef.current, {
        displayMode: true,
        throwOnError: false,
        trust: true,
      })
    } catch {
      previewRef.current.textContent = 'Invalid LaTeX'
    }
  }, [isEditing, latex])

  function handleSave(): void {
    updateLatex(value)

    if (value.trim()) {
      setIsEditing(false)
    }
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSave()
    }

    if (event.key === 'Escape') {
      handleSave()
    }
  }

  function handleTextareaChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    setValue(event.target.value)
  }

  function handlePreviewClick(): void {
    if (!isEditable) {
      return
    }

    setValue(latex)
    setIsEditing(true)
  }

  function handlePreviewMouseEnter(): void {
    if (!isEditable) {
      return
    }

    setIsHovered(true)
  }

  function handlePreviewMouseLeave(): void {
    setIsHovered(false)
  }

  const previewStateStyle = isEditable
    ? isHovered
      ? mathBlockStyles.previewHovered
      : mathBlockStyles.previewEditable
    : mathBlockStyles.previewReadonly

  const previewStyle = { ...mathBlockStyles.preview, ...previewStateStyle }

  if (isEditing) {
    return (
      <div className="math-block-editor" style={mathBlockStyles.wrapper}>
        <div style={mathBlockStyles.toolbar}>
          <span>MathQuill · Formula matematica</span>
          <button onClick={handleSave} style={mathBlockStyles.doneButton} type="button">
            Listo
          </button>
        </div>

        <div style={mathBlockStyles.editorCanvas} onKeyDown={handleEditorKeyDown}>
          <textarea
            value={value}
            onChange={handleTextareaChange}
            placeholder="Escribe la formula en LaTeX"
            spellCheck={false}
            rows={4}
            style={mathBlockStyles.textarea}
          />
        </div>

        {value.trim() && (
          <div style={mathBlockStyles.sourcePreview}>
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
      style={previewStyle}
      onClick={handlePreviewClick}
      onMouseEnter={handlePreviewMouseEnter}
      onMouseLeave={handlePreviewMouseLeave}
    />
  )
}
