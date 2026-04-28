import { createReactBlockSpec } from '@blocknote/react'
import type { ReactElement } from 'react'

import { MathBlock } from './math-block'

export const mathBlockSpec = createReactBlockSpec(
  {
    type: 'math',
    propSchema: {
      latex: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }): ReactElement => {
      function handleUpdateLatex(latex: string): void {
        editor.updateBlock(block, {
          props: { latex },
        })
      }

      return (
        <MathBlock
          latex={block.props.latex}
          isEditable={editor.isEditable}
          updateLatex={handleUpdateLatex}
        />
      )
    },
  },
)
