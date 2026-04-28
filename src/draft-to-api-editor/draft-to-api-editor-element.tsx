import { createRoot, type Root } from 'react-dom/client'

import {
  DRAFT_TO_API_EDITOR_FIELD_CLASS_NAME,
  DRAFT_TO_API_EDITOR_MOUNT_CLASS_NAME,
  DRAFT_TO_API_EDITOR_OBSERVED_ATTRIBUTES,
  VALUE_MISSING_MESSAGE,
} from './draft-to-api-editor.constants'
import { EditorField } from '../editor/editor-field/editor-field'
import type { TEditorFieldHandle } from '../editor/editor-field/editor-field.types'

export class DraftToApiEditorElement extends HTMLElement {
  static readonly formAssociated = true

  static get observedAttributes(): string[] {
    return [...DRAFT_TO_API_EDITOR_OBSERVED_ATTRIBUTES]
  }

  private internals?: ElementInternals
  private root?: Root
  private hiddenInput?: HTMLInputElement
  private reactContainer?: HTMLDivElement
  private editorHandle?: TEditorFieldHandle
  private parentForm?: HTMLFormElement | null
  private currentValue = ''
  private defaultValue = ''
  private didInitializeValue = false
  private valueWhenFocused = ''
  private hasFocusWithin = false
  private readyDispatched = false

  public constructor() {
    super()

    if (typeof this.attachInternals === 'function') {
      this.internals = this.attachInternals()
    }
  }

  public connectedCallback(): void {
    if (!this.didInitializeValue) {
      this.defaultValue = this.getAttribute('value') ?? ''
      this.applyCurrentValue(this.defaultValue)
    }

    this.ensureDom()
    this.attachFormResetListener()
    this.addEventListener('focusin', this.handleFocusIn)
    this.addEventListener('focusout', this.handleFocusOut)
    this.syncFormState()
    this.renderReact()
  }

  public disconnectedCallback(): void {
    this.removeEventListener('focusin', this.handleFocusIn)
    this.removeEventListener('focusout', this.handleFocusOut)
    this.detachFormResetListener()
    this.root?.unmount()
    this.root = undefined
    this.editorHandle = undefined
    this.readyDispatched = false
    this.hasFocusWithin = false
  }

  public attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
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

    this.syncFormState()
    this.renderReact()
  }

  public get name(): string {
    return this.getAttribute('name') ?? ''
  }

  public set name(value: string) {
    this.reflectStringAttribute('name', value)
  }

  public get value(): string {
    return this.currentValue
  }

  public set value(value: string) {
    const nextValue = value ?? ''
    if (nextValue === this.currentValue && this.didInitializeValue) {
      return
    }

    this.applyCurrentValue(nextValue)
  }

  public get disabled(): boolean {
    return this.hasAttribute('disabled')
  }

  public set disabled(value: boolean) {
    this.reflectBooleanAttribute('disabled', value)
  }

  public get readOnly(): boolean {
    return this.hasAttribute('readonly')
  }

  public set readOnly(value: boolean) {
    this.reflectBooleanAttribute('readonly', value)
  }

  public get required(): boolean {
    return this.hasAttribute('required')
  }

  public set required(value: boolean) {
    this.reflectBooleanAttribute('required', value)
  }

  public get placeholder(): string {
    return this.getAttribute('placeholder') ?? ''
  }

  public set placeholder(value: string) {
    this.reflectStringAttribute('placeholder', value)
  }

  public focus(): void {
    this.editorHandle?.focus()
  }

  public getMarkdown(): string {
    return this.currentValue
  }

  public setMarkdown(value: string): void {
    this.value = value
  }

  private applyCurrentValue(value: string): void {
    this.currentValue = value
    this.didInitializeValue = true
    this.syncFormState()

    if (this.editorHandle) {
      this.editorHandle.setMarkdown(value)
      return
    }

    this.renderReact()
  }

  private ensureDom(): void {
    if (!this.internals && !this.hiddenInput) {
      this.hiddenInput = document.createElement('input')
      this.hiddenInput.type = 'hidden'
      this.hiddenInput.tabIndex = -1
      this.hiddenInput.setAttribute('aria-hidden', 'true')
      this.append(this.hiddenInput)
    }

    if (!this.reactContainer) {
      this.reactContainer = document.createElement('div')
      this.reactContainer.className = DRAFT_TO_API_EDITOR_MOUNT_CLASS_NAME
      this.append(this.reactContainer)
    }

    if (!this.root && this.reactContainer) {
      this.root = createRoot(this.reactContainer)
    }
  }

  private syncHiddenInput(): void {
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

  private syncFormState(): void {
    const isValueMissing = this.isValueMissing()

    if (this.internals) {
      this.internals.setFormValue(!this.disabled && this.name ? this.currentValue : null)

      if (isValueMissing) {
        this.internals.setValidity(
          { valueMissing: true },
          VALUE_MISSING_MESSAGE,
          this.reactContainer ?? this,
        )
      } else {
        this.internals.setValidity({})
      }
    }

    if (isValueMissing) {
      this.setAttribute('aria-invalid', 'true')
    } else {
      this.removeAttribute('aria-invalid')
    }

    this.syncHiddenInput()
  }

  private isValueMissing(): boolean {
    return this.required && !this.disabled && !this.readOnly && this.currentValue === ''
  }

  private renderReact(): void {
    if (!this.isConnected || !this.root) {
      return
    }

    this.root.render(
      <EditorField
        ref={this.handleEditorRef}
        value={this.currentValue}
        disabled={this.disabled}
        readonly={this.readOnly}
        placeholder={this.placeholder}
        className={DRAFT_TO_API_EDITOR_FIELD_CLASS_NAME}
        onChange={this.handleEditorChange}
        onReady={this.handleEditorReady}
      />,
    )
  }

  private attachFormResetListener(): void {
    const nextForm = this.internals?.form ?? this.closest('form')
    if (this.parentForm === nextForm) {
      return
    }

    this.detachFormResetListener()
    this.parentForm = nextForm
    this.parentForm?.addEventListener('reset', this.handleFormReset)
  }

  private detachFormResetListener(): void {
    this.parentForm?.removeEventListener('reset', this.handleFormReset)
    this.parentForm = undefined
  }

  private reflectBooleanAttribute(name: string, value: boolean): void {
    if (value) {
      this.setAttribute(name, '')
      return
    }

    this.removeAttribute(name)
  }

  private reflectStringAttribute(name: string, value: string): void {
    if (!value) {
      this.removeAttribute(name)
      return
    }

    this.setAttribute(name, value)
  }

  private handleEditorRef = (handle: TEditorFieldHandle | null): void => {
    this.editorHandle = handle ?? undefined
  }

  private handleEditorChange = (nextValue: string): void => {
    this.currentValue = nextValue
    this.syncFormState()
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
  }

  private handleEditorReady = (handle: TEditorFieldHandle): void => {
    this.editorHandle = handle

    if (this.readyDispatched) {
      return
    }

    this.readyDispatched = true
    this.dispatchEvent(new CustomEvent('ready', { bubbles: true, composed: true }))
  }

  private handleFormReset = (): void => {
    queueMicrotask(() => {
      this.applyCurrentValue(this.defaultValue)
    })
  }

  private handleFocusIn = (): void => {
    if (this.hasFocusWithin) {
      return
    }

    this.hasFocusWithin = true
    this.valueWhenFocused = this.currentValue
  }

  private handleFocusOut = (event: FocusEvent): void => {
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
