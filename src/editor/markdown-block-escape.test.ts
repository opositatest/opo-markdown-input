import { describe, it, expect } from 'vitest'
import { escapeBlockMarkers, escapeLeadingBlockMarker } from './markdown-block-escape'

describe('escapeLeadingBlockMarker', () => {
  it('escapes the delimiter of an ordered list marker', () => {
    expect(escapeLeadingBlockMarker('3. No será preciso')).toBe('3\\. No será preciso')
    expect(escapeLeadingBlockMarker('1. texto')).toBe('1\\. texto')
    expect(escapeLeadingBlockMarker('12) texto')).toBe('12\\) texto')
  })

  it('escapes a bare ordered list marker', () => {
    expect(escapeLeadingBlockMarker('3.')).toBe('3\\.')
  })

  it('escapes bullet list markers', () => {
    expect(escapeLeadingBlockMarker('- texto')).toBe('\\- texto')
    expect(escapeLeadingBlockMarker('* texto')).toBe('\\* texto')
    expect(escapeLeadingBlockMarker('+ texto')).toBe('\\+ texto')
  })

  it('escapes heading, quote and code fence markers', () => {
    expect(escapeLeadingBlockMarker('# texto')).toBe('\\# texto')
    expect(escapeLeadingBlockMarker('### texto')).toBe('\\### texto')
    expect(escapeLeadingBlockMarker('> texto')).toBe('\\> texto')
    expect(escapeLeadingBlockMarker('```js')).toBe('\\```js')
    expect(escapeLeadingBlockMarker('~~~')).toBe('\\~~~')
  })

  it('escapes every line start, not only the first one', () => {
    expect(escapeLeadingBlockMarker('foo  \n3. bar')).toBe('foo  \n3\\. bar')
  })

  it('leaves text that cannot open a block untouched', () => {
    expect(escapeLeadingBlockMarker('normal sin numero')).toBe('normal sin numero')
    expect(escapeLeadingBlockMarker('3.5. Caso raro')).toBe('3.5. Caso raro')
    expect(escapeLeadingBlockMarker('1.ª Cuando no comparezca')).toBe('1.ª Cuando no comparezca')
    expect(escapeLeadingBlockMarker('#sin espacio')).toBe('#sin espacio')
    expect(escapeLeadingBlockMarker('*enfasis*')).toBe('*enfasis*')
    expect(escapeLeadingBlockMarker('')).toBe('')
  })
})

describe('escapeBlockMarkers', () => {
  const paragraph = (text: string) => ({
    type: 'paragraph',
    props: { textAlignment: 'left' },
    content: [{ type: 'text', text, styles: {} }],
  })

  it('returns a copy with the escaped text for a paragraph', () => {
    const block = paragraph('3. No será preciso')

    const escaped = escapeBlockMarkers(block)

    expect(escaped).toEqual({
      type: 'paragraph',
      props: { textAlignment: 'left' },
      content: [{ type: 'text', text: '3\\. No será preciso', styles: {} }],
    })
  })

  it('never mutates the original block', () => {
    const block = paragraph('3. No será preciso')

    escapeBlockMarkers(block)

    expect(block.content[0].text).toBe('3. No será preciso')
  })

  it('returns the same reference when there is nothing to escape', () => {
    const block = paragraph('texto normal')
    expect(escapeBlockMarkers(block)).toBe(block)
  })

  it('keeps the rest of the inline content untouched', () => {
    const block = {
      type: 'paragraph',
      content: [
        { type: 'text', text: '3. inicio', styles: { bold: true } },
        { type: 'link', href: 'https://example.com', content: [{ type: 'text', text: ' enlace' }] },
      ],
    }

    const escaped = escapeBlockMarkers(block) as typeof block

    expect(escaped.content[0]).toEqual({ type: 'text', text: '3\\. inicio', styles: { bold: true } })
    expect(escaped.content[1]).toBe(block.content[1])
  })

  it('ignores blocks that cannot be confused with another block type', () => {
    const heading = { type: 'heading', content: [{ type: 'text', text: '3. Encabezado' }] }
    expect(escapeBlockMarkers(heading)).toBe(heading)

    const listItem = { type: 'numberedListItem', content: [{ type: 'text', text: '3. Apartado' }] }
    expect(escapeBlockMarkers(listItem)).toBe(listItem)
  })

  it('ignores a paragraph whose first inline node is not text', () => {
    const block = { type: 'paragraph', content: [{ type: 'link', href: 'https://example.com' }] }
    expect(escapeBlockMarkers(block)).toBe(block)
  })

  it('ignores a paragraph without inline content', () => {
    const block = { type: 'paragraph' }
    expect(escapeBlockMarkers(block)).toBe(block)
  })
})
