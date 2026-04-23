import { FileText, RefreshCcw } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import type { DraftToApiEditorElement } from "@/register-web-component";

export default function Editor() {
  const bodyRef = useRef<DraftToApiEditorElement | null>(null);
  const summaryRef = useRef<DraftToApiEditorElement | null>(null);
  const [submittedData, setSubmittedData] = useState<Record<string, FormDataEntryValue>>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setSubmittedData(Object.fromEntries(formData.entries()));
  };

  return (
    <div className="min-h-screen bg-canvas text-foreground antialiased">
      <header
        className="sticky top-0 z-10 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"
            style={{ boxShadow: "var(--shadow-subtle)" }}
          >
            <FileText className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-lg font-semibold tracking-tight">Draft-to-API Web Component</h1>
            <p className="text-sm text-muted-foreground">
              Demo con dos instancias, submit, reset y cambio programático de valor.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-3xl bg-card p-6" style={{ boxShadow: "var(--shadow-sheet)" }}>
            <div className="mb-4">
              <h2 className="text-base font-semibold">Formulario host</h2>
              <p className="text-sm text-muted-foreground">
                Cada editor mantiene su propio estado y sincroniza un `hidden input` distinto.
              </p>
            </div>

            <div className="space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-medium">Body</span>
                <draft-to-api-editor
                  ref={(element) => {
                    bodyRef.current = element;
                  }}
                  name="body"
                  value={"Texto inicial del body\n\n$$\nx^2 + y^2 = z^2\n$$"}
                  placeholder="Escribe el body..."
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Summary</span>
                <draft-to-api-editor
                  ref={(element) => {
                    summaryRef.current = element;
                  }}
                  name="summary"
                  value="Resumen inicial"
                  placeholder="Escribe el resumen..."
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Submit del formulario
              </button>

              <button
                type="reset"
                className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"
              >
                Reset del formulario
              </button>

              <button
                type="button"
                onClick={() => {
                  summaryRef.current?.setMarkdown("Resumen actualizado desde JS");
                  summaryRef.current?.focus();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"
              >
                <RefreshCcw className="h-4 w-4" />
                Cambio programático
              </button>
            </div>
          </section>
        </form>

        <aside className="space-y-6">
          <section className="rounded-3xl bg-card p-6" style={{ boxShadow: "var(--shadow-sheet)" }}>
            <h2 className="text-base font-semibold">Resultado del submit</h2>
            <pre className="mt-4 overflow-auto rounded-2xl bg-muted p-4 text-xs leading-6 text-muted-foreground">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </section>

          <section className="rounded-3xl bg-card p-6" style={{ boxShadow: "var(--shadow-sheet)" }}>
            <h2 className="text-base font-semibold">Checks del plan</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Etiqueta pública: `draft-to-api-editor`</li>
              <li>Múltiples instancias independientes</li>
              <li>Sincronización automática a Markdown</li>
              <li>Submit y reset de formulario</li>
              <li>API JS con `setMarkdown()` y `focus()`</li>
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}
