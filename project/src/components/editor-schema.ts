import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { filterSuggestionItems, insertOrUpdateBlockForSlashMenu } from "@blocknote/core/extensions";
import { DefaultReactSuggestionItem, getDefaultReactSlashMenuItems } from "@blocknote/react";
import { MathBlock } from "./MathBlock";

export const editorSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    math: MathBlock(),
  },
});

function getMathSlashMenuItem(
  editor: typeof editorSchema.BlockNoteEditor,
): DefaultReactSuggestionItem {
  return {
    title: "Fórmula Matemática",
    onItemClick: () => {
      insertOrUpdateBlockForSlashMenu(editor, { type: "math" } as never);
    },
    aliases: ["math", "latex", "katex", "formula", "ecuacion"],
    group: "Media",
    subtext: "Inserta una fórmula LaTeX renderizada con KaTeX",
  };
}

export function getEditorSlashMenuItems(editor: typeof editorSchema.BlockNoteEditor) {
  return [
    ...getDefaultReactSlashMenuItems(editor),
    getMathSlashMenuItem(editor),
  ];
}

export function filterEditorSlashMenuItems(
  editor: typeof editorSchema.BlockNoteEditor,
  query: string,
) {
  return filterSuggestionItems(getEditorSlashMenuItems(editor), query);
}
