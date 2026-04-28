import { useRef, useState, type FormEvent, type ReactElement } from 'react';

import type { MarkdownTextEditorElement } from '../markdown-text-editor/markdown-text-editor-element';
import {
  BODY_EDITOR_HEIGHT,
  BODY_INITIAL_MARKDOWN,
  DEMO_BADGES,
  DEMO_HIGHLIGHTS,
  HOST_FORM_CHECKS,
  INITIAL_SUBMITTED_DATA,
  PROGRAMMATIC_SUMMARY_MARKDOWN,
  SUMMARY_EDITOR_HEIGHT,
  SUMMARY_INITIAL_MARKDOWN,
  SUMMARY_EDITOR_WIDTH,
} from './app.constants';

type TSubmittedData = Record<string, FormDataEntryValue>;

export function App(): ReactElement {
  const bodyRef = useRef<MarkdownTextEditorElement | null>(null);
  const summaryRef = useRef<MarkdownTextEditorElement | null>(null);
  const [submittedData, setSubmittedData] = useState<TSubmittedData>(INITIAL_SUBMITTED_DATA);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setSubmittedData(Object.fromEntries(formData.entries()));
  }

  function handleBodyRef(element: MarkdownTextEditorElement | null): void {
    bodyRef.current = element;
  }

  function handleSummaryRef(element: MarkdownTextEditorElement | null): void {
    summaryRef.current = element;
  }

  function handleProgrammaticSummaryUpdate(): void {
    summaryRef.current?.setMarkdown(PROGRAMMATIC_SUMMARY_MARKDOWN);
    summaryRef.current?.focus();
  }

  function handleBodyFocus(): void {
    bodyRef.current?.focus();
  }

  function renderBadge(item: string): ReactElement {
    return (
      <li key={item} className="badge-item">
        {item}
      </li>
    );
  }

  function renderHighlight(item: string): ReactElement {
    return <li key={item}>{item}</li>;
  }

  function renderHostFormCheck(item: string): ReactElement {
    return <li key={item}>{item}</li>;
  }

  return (
    <div className="demo-page">
      <header className="panel hero-panel">
        <div className="hero-layout">
          <div>
            <p className="eyebrow">Markdown Text Editor</p>
            <h1>Polished authoring UI for forms, docs, and embedded workflows.</h1>
            <p className="lede">
              This demo shows the web component inside a regular host form with live
              Markdown serialization, programmatic control, and isolated editor
              instances.
            </p>

            <ul className="badge-list">{DEMO_BADGES.map(renderBadge)}</ul>
          </div>

          <section className="hero-card">
            <p className="section-kicker">Demo goals</p>
            <h2>Ready for a clean README screenshot</h2>
            <ul className="result-list">{DEMO_HIGHLIGHTS.map(renderHighlight)}</ul>
          </section>
        </div>
      </header>

      <main className="demo-layout">
        <form className="demo-form" onSubmit={handleSubmit}>
          <section className="panel editor-panel">
            <div className="panel-heading">
              <p className="section-kicker">Live playground</p>
              <h2>Compose an announcement</h2>
              <p>
                Use the fields below to test submit, reset, focus management, and
                JavaScript-driven updates from the host page.
              </p>
            </div>

            <div className="editor-grid">
              <label className="field-group field-group-main">
                <div className="field-heading">
                  <span>Article body</span>
                  <p className="field-copy">
                    Long-form content with headings, lists, quotes, and display math.
                  </p>
                </div>

                <markdown-text-editor
                  ref={handleBodyRef}
                  height={BODY_EDITOR_HEIGHT}
                  name="body"
                  value={BODY_INITIAL_MARKDOWN}
                  placeholder="Write the announcement body..."
                />
              </label>

              <label className="field-group">
                <div className="field-heading">
                  <span>Summary</span>
                  <p className="field-copy">
                    Short description for previews, changelogs, or metadata fields.
                  </p>
                </div>

                <markdown-text-editor
                  ref={handleSummaryRef}
                  height={SUMMARY_EDITOR_HEIGHT}
                  name="summary"
                  value={SUMMARY_INITIAL_MARKDOWN}
                  placeholder="Write a concise summary..."
                  width={SUMMARY_EDITOR_WIDTH}
                />
              </label>
            </div>

            <div className="action-row">
              <button type="submit">Submit form</button>
              <button type="reset" className="secondary-button">
                Reset form
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={handleProgrammaticSummaryUpdate}
              >
                Inject summary via JS
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={handleBodyFocus}
              >
                Focus body editor
              </button>
            </div>
          </section>
        </form>

        <aside className="sidebar">
          <section className="panel compact-panel">
            <p className="section-kicker">Current payload</p>
            <h2>Serialized Markdown</h2>
            <pre>{JSON.stringify(submittedData, null, 2)}</pre>
          </section>

          <section className="panel compact-panel">
            <p className="section-kicker">Host integration</p>
            <h2>What this page verifies</h2>
            <ul className="result-list">{HOST_FORM_CHECKS.map(renderHostFormCheck)}</ul>
          </section>
        </aside>
      </main>
    </div>
  );
}
