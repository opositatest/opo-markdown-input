import { createRoot, type Root } from 'react-dom/client'
import { EditorField, type EditorFieldHandle } from './editor/EditorField'

const TAG_NAME = 'draft-to-api-editor'

export class DraftToApiEditorElement extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'value', 'placeholder', 'disabled', 'readonly', 'required']
  }

  private root?: Root
  private hiddenInput?: HTMLInputElement
  private reactContainer?: HTMLDivElement
  private editorHandle?: EditorFieldHandle
  private form?: HTMLFormElement | null
  private currentValue = ''
  private defaultValue = ''
  private didInitializeValue = false
  private valueWhenFocused = ''
  private hasFocusWithin = false
  private readyDispatched = false

  connectedCallback() {
    if (!this.didInitializeValue) {
      this.defaultValue = this.getAttribute('value') ?? ''
      this.applyCurrentValue(this.defaultValue)
    }

    this.ensureDom()
    this.attachFormResetListener()
    this.addEventListener('focusin', this.handleFocusIn)
    this.addEventListener('focusout', this.handleFocusOut)
    this.syncHiddenInput()
    this.renderReact()
  }

  disconnectedCallback() {
    this.removeEventListener('focusin', this.handleFocusIn)
    this.removeEventListener('focusout', this.handleFocusOut)
    this.detachFormResetListener()
    this.root?.unmount()
    this.root = undefined
    this.editorHandle = undefined
    this.readyDispatched = false
    this.hasFocusWithin = false
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) {
      return
    }

    if (name === 'value') {
      this.defaultValue = newValue ?? ''
      this.applyCurrentValue(this.defaultValue)
    }

    if (name === 'name') {
      this.attachFormResetListener()
    }

    this.syncHiddenInput()
    this.renderReact()
  }

  get name() {
    return this.getAttribute('name') ?? ''
  }

  set name(value: string) {
    this.reflectStringAttribute('name', value)
  }

  get value() {
    return this.currentValue
  }

  set value(value: string) {
    const nextValue = value ?? ''
    if (nextValue === this.currentValue && this.didInitializeValue) {
      return
    }

    this.applyCurrentValue(nextValue)
  }

  get disabled() {
    return this.hasAttribute('disabled')
  }

  set disabled(value: boolean) {
    this.reflectBooleanAttribute('disabled', value)
  }

  get readOnly() {
    return this.hasAttribute('readonly')
  }

  set readOnly(value: boolean) {
    this.reflectBooleanAttribute('readonly', value)
  }

  get required() {
    return this.hasAttribute('required')
  }

  set required(value: boolean) {
    this.reflectBooleanAttribute('required', value)
  }

  get placeholder() {
    return this.getAttribute('placeholder') ?? ''
  }

  set placeholder(value: string) {
    this.reflectStringAttribute('placeholder', value)
  }

  focus() {
    this.editorHandle?.focus()
  }

  getMarkdown() {
    return this.currentValue
  }

  setMarkdown(value: string) {
    this.value = value
  }

  private applyCurrentValue(value: string) {
    this.currentValue = value
    this.didInitializeValue = true
    this.syncHiddenInput()

    if (this.editorHandle) {
      this.editorHandle.setMarkdown(value)
      return
    }

    this.renderReact()
  }

  private ensureDom() {
    if (!this.hiddenInput) {
      this.hiddenInput = document.createElement('input')
      this.hiddenInput.type = 'hidden'
      this.hiddenInput.tabIndex = -1
      this.hiddenInput.setAttribute('aria-hidden', 'true')
      this.append(this.hiddenInput)
    }

    if (!this.reactContainer) {
      this.reactContainer = document.createElement('div')
      this.reactContainer.className = 'draft-to-api-editor__mount'
      this.append(this.reactContainer)
    }

    if (!this.root && this.reactContainer) {
      this.root = createRoot(this.reactContainer)
    }
  }

  private syncHiddenInput() {
    if (!this.hiddenInput) {
      return
    }

    if (this.name) {
      this.hiddenInput.name = this.name
    } else {
      this.hiddenInput.removeAttribute('name')
    }

    this.hiddenInput.defaultValue = this.defaultValue
    this.hiddenInput.value = this.currentValue
    this.hiddenInput.disabled = this.disabled
    this.hiddenInput.required = this.required
  }

  private renderReact() {
    if (!this.isConnected || !this.root) {
      return
    }

    this.root.render(
      <EditorField
        ref={(handle) => {
          this.editorHandle = handle ?? undefined
        }}
        value={this.currentValue}
        disabled={this.disabled}
        readonly={this.readOnly}
        placeholder={this.placeholder}
        className="draft-to-api-editor__field"
        onChange={(nextValue) => {
          this.currentValue = nextValue
          this.syncHiddenInput()
          this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
        }}
        onReady={(handle) => {
          this.editorHandle = handle

          if (this.readyDispatched) {
            return
          }

          this.readyDispatched = true
          this.dispatchEvent(new CustomEvent('ready', { bubbles: true, composed: true }))
        }}
      />,
    )
  }

  private attachFormResetListener() {
    const nextForm = this.closest('form')
    if (this.form === nextForm) {
      return
    }

    this.detachFormResetListener()
    this.form = nextForm
    this.form?.addEventListener('reset', this.handleFormReset)
  }

  private detachFormResetListener() {
    this.form?.removeEventListener('reset', this.handleFormReset)
    this.form = undefined
  }

  private reflectBooleanAttribute(name: string, value: boolean) {
    if (value) {
      this.setAttribute(name, '')
      return
    }

    this.removeAttribute(name)
  }

  private reflectStringAttribute(name: string, value: string) {
    if (!value) {
      this.removeAttribute(name)
      return
    }

    this.setAttribute(name, value)
  }

  private handleFormReset = () => {
    queueMicrotask(() => {
      this.applyCurrentValue(this.defaultValue)
    })
  }

  private handleFocusIn = () => {
    if (this.hasFocusWithin) {
      return
    }

    this.hasFocusWithin = true
    this.valueWhenFocused = this.currentValue
  }

  private handleFocusOut = (event: FocusEvent) => {
    const nextTarget = event.relatedTarget
    if (nextTarget instanceof Node && this.contains(nextTarget)) {
      return
    }

    if (!this.hasFocusWithin) {
      return
    }

    this.hasFocusWithin = false

    if (this.currentValue !== this.valueWhenFocused) {
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
    }
  }
}

export function registerDraftToApiEditor() {
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, DraftToApiEditorElement)
  }
}

registerDraftToApiEditor()
