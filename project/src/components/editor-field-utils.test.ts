import { describe, expect, it } from "vitest";
import { editorBlocksToMarkdown, markdownToEditorBlocks } from "./editor-field-utils";

type StubBlock = {
  type: "markdown" | "math";
  props: {
    markdown?: string;
    latex?: string;
  };
};

const createStubEditor = () => ({
  document: [] as StubBlock[],
  tryParseMarkdownToBlocks(markdown: string) {
    return [{ type: "markdown", props: { markdown } }];
  },
  blocksToMarkdownLossy(blocks = []) {
    return blocks
      .map((block) => block.props.markdown ?? "")
      .filter(Boolean)
      .join("\n\n");
  },
});

describe("editor field markdown helpers", () => {
  it("parses markdown and math blocks in order", () => {
    const editor = createStubEditor();

    expect(
      markdownToEditorBlocks(editor, "Introducción\n\n$$\nx^2 + y^2 = z^2\n$$\n\nCierre"),
    ).toEqual([
      { type: "markdown", props: { markdown: "Introducción" } },
      { type: "math", props: { latex: "x^2 + y^2 = z^2" } },
      { type: "markdown", props: { markdown: "Cierre" } },
    ]);
  });

  it("serializes math blocks back to markdown", () => {
    const editor = createStubEditor();

    expect(
      editorBlocksToMarkdown(editor, [
        { type: "markdown", props: { markdown: "Texto" } },
        { type: "math", props: { latex: "a=b" } },
        { type: "markdown", props: { markdown: "Final" } },
      ]),
    ).toBe("Texto\n\n$$\na=b\n$$\n\nFinal");
  });
});
