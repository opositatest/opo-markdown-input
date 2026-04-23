import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  DefaultReactSuggestionItem,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
} from "@blocknote/core";
import {
  filterSuggestionItems,
  insertOrUpdateBlockForSlashMenu,
} from "@blocknote/core/extensions";
import "@blocknote/mantine/style.css";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Share, FileText, Loader2, Check } from "lucide-react";
import { MathBlock } from "./MathBlock";

const STORAGE_KEY = "draft-to-api-content";

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    math: MathBlock(),
  },
});

const getMathSlashMenuItem = (editor: typeof schema.BlockNoteEditor): DefaultReactSuggestionItem => ({
  title: "Fórmula Matemática",
  onItemClick: () => {
    insertOrUpdateBlockForSlashMenu(editor, { type: "math" } as any);
  },
  aliases: ["math", "latex", "katex", "formula", "ecuacion"],
  group: "Media",
  subtext: "Inserta una fórmula LaTeX renderizada con KaTeX",
});

const getCustomSlashMenuItems = (editor: typeof schema.BlockNoteEditor): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor),
  getMathSlashMenuItem(editor),
];

export default function Editor() {
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const editor = useCreateBlockNote({
    schema,
    initialContent: getStoredContent(),
  });

  // Auto-save to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      const content = JSON.stringify(editor.document);
      localStorage.setItem(STORAGE_KEY, content);
    }, 2000);
    return () => clearInterval(interval);
  }, [editor]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      const blocks = editor.document;
      
      // Split blocks into groups: non-math and math
      const parts: string[] = [];
      let nonMathBatch: typeof blocks = [];

      const flushNonMath = async () => {
        if (nonMathBatch.length > 0) {
          const md = await editor.blocksToMarkdownLossy(nonMathBatch as any);
          if (md.trim()) parts.push(md.trim());
          nonMathBatch = [];
        }
      };

      for (const block of blocks) {
        if (block.type === "math" && block.props?.latex) {
          await flushNonMath();
          parts.push(`$$\n${block.props.latex}\n$$`);
        } else {
          nonMathBatch.push(block);
        }
      }
      await flushNonMath();

      const finalMarkdown = parts.join("\n\n");
      await navigator.clipboard.writeText(finalMarkdown);

      setExported(true);
      toast.success("Markdown copiado al portapapeles", {
        description: "Las fórmulas se exportan con delimitadores $$.",
      });

      setTimeout(() => setExported(false), 2000);
    } catch {
      toast.error("Error al exportar", {
        description: "No se pudo procesar el contenido.",
      });
    } finally {
      setIsExporting(false);
    }
  }, [editor]);

  return (
    <div className="min-h-screen bg-canvas text-foreground antialiased">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-md" style={{ boxShadow: "0 1px 0 rgba(0,0,0,.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center" style={{ boxShadow: "var(--shadow-subtle)" }}>
            <FileText className="w-4.5 h-4.5 text-accent-foreground" />
          </div>
          <span className="font-semibold tracking-tight text-foreground">Draft-to-API</span>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : exported ? (
            <Check className="w-4 h-4" />
          ) : (
            <Share className="w-4 h-4" />
          )}
          <span>{isExporting ? "Exportando..." : exported ? "Copiado" : "Exportar Markdown"}</span>
        </button>
      </header>

      {/* Editor Canvas */}
      <main className="max-w-4xl mx-auto py-16 px-6">
        <div
          className="bg-card rounded-3xl p-8"
          style={{ boxShadow: "var(--shadow-sheet)" }}
        >
          <BlockNoteView
            editor={editor}
            theme="light"
            className="min-h-[60vh]"
            slashMenu={false}
          >
            <SuggestionMenuController
              triggerCharacter="/"
              getItems={async (query) =>
                filterSuggestionItems(getCustomSlashMenuItems(editor as any), query)
              }
            />
          </BlockNoteView>
        </div>

        <footer className="mt-8 flex justify-center">
          <div className="px-4 py-1.5 bg-muted rounded-full text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
            Block-based composition • Markdown output • LaTeX math
          </div>
        </footer>
      </main>
    </div>
  );
}

function getStoredContent() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return undefined;
}
