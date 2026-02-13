/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

import { PiCoValuable } from './pc_valuable.mjs'

export class PiCoField extends PiCoValuable {
    css() {
        return `
            * {
                box-sizing: border-box;
            }
            :host {
                box-sizing: border-box;
                vertical-align: middle;
                display: inline-flex;
                align-items: center;
                width: 15em;
            }
            pc-input {
                flex: 2 1;
                border: none;
                border-radius: 0;
                border-bottom: .05em solid hsl(0 0 50/.75);
            }
            pc-input:focus {
                outline: none;
                box-shadow: -.3em 0 0 0 hsl(220 90 70);
            }
            pc-label {
                flex: 1 1;
                font-variant: small-caps;
                font-size: .8em;
                padding: 0;
                text-align: right;
            }
            sep {
                display: block;
                font-size: .7em;
                padding: 0 .4em;
            }
        `
    }
    htm() {
        return `
            <pc-label part="label">name</pc-label>
            <sep></sep>
            <pc-input part="input" type="string"></pc-input>
        `
    }
    onCreation() {
        this.input = this.shadowRoot.querySelector('pc-input')
        this.label = this.shadowRoot.querySelector('pc-label')
        this.input.addEventListener('change',e=>{
            let ne = new Event('change',e)
            ne.value = this.input.value
            this.dispatchEvent(ne)
        })
    }

    static get observedAttributes() { 
        return ['text','sep','type','value', 'pca-design','passive','fire-on-blur']
    }
    onAttributeChanged(name, oldValue, newValue) {
        switch (name) {
            case 'text': {
                this.label.setAttribute('text', newValue)
                break
            }
            case 'sep': {
                let sep = this.shadowRoot.querySelector('sep')
                sep.innerHTML = newValue
                sep.style.display = newValue? 'block':'none'
                break
            }
            case 'type': {
                this.input.setAttribute('type', newValue)
                break
            }
            case 'value': {
                this.input.setAttribute('value', newValue)
                break
            }
            case 'passive': {
                super.onAttributeChanged(name,oldValue,newValue)
                break
            }
            case 'pca-design': {
                super.onAttributeChanged(name,oldValue,newValue)
                break
            }
            case 'fire-on-blur': {
                this.input.setAttribute('fire-on-blur', newValue)
                break
            }
        }
    }

    get passive() {return this.input.passive}
    set passive(v) { this.input.passive = v }

    get value() { return this.input.value }
    set value(v) {
        this.input.value = v
    }

}

try { customElements.define('pc-field', PiCoField) } catch {}