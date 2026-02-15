/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

import { PiCoValuable } from './pc_valuable.mjs'
import '../ext/x_date_picker.mjs'

export class PiCoFieldDate extends PiCoValuable {
    css() {
        return super.css() + `
            :host {
                position: relative;
                box-sizing: border-box;
                vertical-align: middle;
                display: inline-flex;
                align-items: start;
                width: 15em;
                flex-direction: column;
                line-height: .9em;
                outline: none!important;
            }
            input {
                box-sizing: border-box;
                flex: 2 1;
                border: none;
                border-radius: 0;
                border-bottom: 1px solid hsla(0, 0%, 50%, .75);
                width: 100%;
                --padding: .4em;
                background-color: transparent;

            }
            input:focus {
                --box-shadow: -.3em 0 0 0 hsl(220 90 70);
            }
            label {
                box-sizing: border-box;
                flex: 1 1;
                font-variant: small-caps;
                font-size: .7em;
                text-align: right;
                color: hsl(0, 0%, 35%);
                white-space: nowrap;
            }
            sep {
                display: block;
                font-size: .7em;
                padding: 0 .4em;
            }
            pc-icon {
                position: absolute;
                right: .5em;
                bottom: .8em;
                display: none;
            }
        `
    }
    htm() {
        return `
            <label part="label">name</label>
            <sep></sep>
            <x-date-picker></x-date-picker>
        `
    }
    onCreation() {
        this.input = this.shadowRoot.querySelector('input')
        this.label = this.shadowRoot.querySelector('label')
        this.date = this.shadowRoot.querySelector('x-date-picker')

        this.date.addEventListener('change', e => {
            let ne = new Event('change', e)
            ne.value = this.date.value
            this.dispatchEvent(ne)
        })

    }

    static get observedAttributes() {
        return [...PiCoValuable.observedAttributes, 'label', 'placeholder', 'readonly', 'type']
    }
    _set_label(v) {
        this.label.innerHTML = v
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

    get value() {
        return this.date.value
        const type = this.input.getAttribute('type')
        return type == 'password' ? this.input.password : this.input.value
    }
    set value(v) {
        this.date.value = v
    }

}

try { customElements.define('pc-field-date', PiCoFieldDate) } catch { }