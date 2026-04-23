import { BlockNoteView } from "@blocknote/mantine";
import {
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import "@blocknote/mantine/style.css";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { editorBlocksToMarkdown, markdownToEditorBlocks } from "./editor-field-utils";
import { editorSchema, filterEditorSlashMenuItems } from "./editor-schema";

export type EditorFieldHandle = {
  focus(): void;
  getMarkdown(): string;
  setMarkdown(value: string): void;
};

type EditorFieldProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  className?: string;
  onReady?: (handle: EditorFieldHandle) => void;
};

export const EditorField = forwardRef<EditorFieldHandle, EditorFieldProps>(
  function EditorField(
    {
      value,
      defaultValue,
      onChange,
      disabled = false,
      readonly = false,
      placeholder,
      className,
      onReady,
    },
    ref,
  ) {
    const currentMarkdownRef = useRef(value ?? defaultValue ?? "");
    const applyingExternalValueRef = useRef(false);

    const editor = useCreateBlockNote(
      {
        schema: editorSchema,
        placeholders: placeholder
          ? { default: placeholder, emptyDocument: placeholder }
          : undefined,
      },
      [placeholder],
    );

    const syncEditorMarkdown = useCallback((nextMarkdown: string) => {
      applyingExternalValueRef.current = true;

      editor.replaceBlocks(
        editor.document,
        markdownToEditorBlocks(editor, nextMarkdown),
      );

      currentMarkdownRef.current = editorBlocksToMarkdown(editor);
      applyingExternalValueRef.current = false;
    }, [editor]);

    useEffect(() => {
      const nextMarkdown = value ?? currentMarkdownRef.current;
      const editorMarkdown = editorBlocksToMarkdown(editor);

      if (nextMarkdown === editorMarkdown) {
        currentMarkdownRef.current = editorMarkdown;
        return;
      }

      syncEditorMarkdown(nextMarkdown);
    }, [editor, syncEditorMarkdown, value]);

    const handleRef = useRef<EditorFieldHandle>({
      focus: () => {},
      getMarkdown: () => currentMarkdownRef.current,
      setMarkdown: () => {},
    });

    handleRef.current = {
      focus: () => {
        editor.focus();
      },
      getMarkdown: () => currentMarkdownRef.current,
      setMarkdown: (nextMarkdown: string) => {
        currentMarkdownRef.current = nextMarkdown;
        syncEditorMarkdown(nextMarkdown);
      },
    };

    useImperativeHandle(ref, () => handleRef.current, []);

    useEffect(() => {
      onReady?.(handleRef.current);
    }, [editor, onReady]);

    return (
      <div
        className={className}
        data-disabled={disabled ? "true" : undefined}
        data-readonly={readonly ? "true" : undefined}
      >
        <BlockNoteView
          editor={editor}
          theme="light"
          className="draft-to-api-editor-field min-h-[320px]"
          editable={!disabled && !readonly}
          slashMenu={false}
          onChange={() => {
            if (applyingExternalValueRef.current) {
              return;
            }

            const nextMarkdown = editorBlocksToMarkdown(editor);
            if (nextMarkdown === currentMarkdownRef.current) {
              return;
            }

            currentMarkdownRef.current = nextMarkdown;
            onChange?.(nextMarkdown);
          }}
        >
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) => filterEditorSlashMenuItems(editor as never, query)}
          />
        </BlockNoteView>
      </div>
    );
  },
);
