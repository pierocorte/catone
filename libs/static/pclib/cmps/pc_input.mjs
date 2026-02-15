import { PiCoComponent } from './pc_component.mjs'
import { PiCoValuable } from './pc_valuable.mjs'

export class PiCoInput extends PiCoValuable {
    css() {
        return super.css() + `
            :host {                                    
                border-radius: .25em;
                padding: 0;
                width: fit-content;
                height: fit-content;
                min-width: 6em;
                width: 6em;
                border: .5px solid var(--bdc);
                overflow: hidden;
            }
            :host(.disabled) {
                background-color: var(--btn-disc);
            }
            input {
                all: unset;
                padding: 0 .25em;
                width: 100%;
            }
            input::placeholder {
                font-style: italic;
                opacity: 0.5;
            }
        `
    }
    htm() {
        return `
            <input>
        `
    }

    onCreation() {
        super.onCreation()
        const root = this.shadowRoot
        this.input = root.querySelector('input')
        this.setAttribute('pca-focusable', '')
        this.value = ''
        this._fire = true
    }
    onInitialization() {
        this.input.addEventListener('blur', e => {
            if (this._disabled) return
            this.value = this.input.value
            if (this._fire) this._firePceBlur()
        })
        this.input.addEventListener('focus', e => {
            if (this._disabled) return
            if (this._fire) this._firePceFocus()
        })
        this.input.addEventListener('keydown', e => {
            if (e.key == 'Enter') {
                e.preventDefault()
                this.blur()
            }
        })
        this.input.addEventListener('keyup', e => {
            this.value = this.input.value
            this.dispatchEvent(new CustomEvent('input', { bubbles: true }))
        })

    }

    static get observedAttributes() {
        return [...PiCoValuable.observedAttributes, 'placeholder', 'readonly', 'type']
    }
    _set_placeholder(v) {
        this.input.setAttribute('placeholder', v)
    }
    _set_readonly(v) {
        this.input.setAttribute('readonly', v)
    }
    _set_type(v) {
        this.input.setAttribute('type', v)
    }
    _set_pcaDesign(v) {
        super._set_pcaDesign(v)
        if (v != null) this.setAttribute('tabindex', -1)
        else this.removeAttribute('tabindex')
    }
    _set_pcaDisabled(v) {
        super._set_pcaDisabled(v)
        if (v != null) this.setAttribute('tabindex', -1)
        else this.removeAttribute('tabindex')
    }


    get value() { return super.value }
    set value(v) {
        super.value = v
        return this.input.value = v
    }

    getCurrentValue() { return this.input.value }

    focus() {
        this.input.focus()
    }

}

try { customElements.define('pc-input', PiCoInput) } catch { }