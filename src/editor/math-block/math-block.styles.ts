import type { CSSProperties } from 'react'

type TMathBlockStyles = {
  wrapper: CSSProperties
  toolbar: CSSProperties
  doneButton: CSSProperties
  editorCanvas: CSSProperties
  textarea: CSSProperties
  sourcePreview: CSSProperties
  preview: CSSProperties
  previewEditable: CSSProperties
  previewHovered: CSSProperties
  previewReadonly: CSSProperties
}

export const mathBlockStyles: TMathBlockStyles = {
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
    resize: 'vertical',
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
    textAlign: 'center',
    borderRadius: '1rem',
    transition: 'background 0.15s ease',
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEditable: {
    cursor: 'pointer',
    background: 'transparent',
  },
  previewHovered: {
    cursor: 'pointer',
    background: '#f1f5f9',
  },
  previewReadonly: {
    cursor: 'default',
    background: 'transparent',
  },
}
