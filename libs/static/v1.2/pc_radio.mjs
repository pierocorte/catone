/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

import { PiCoComponent } from './pc_component.mjs'
import { PiCoValuable } from './pc_valuable.mjs'

export class PiCoRadio extends PiCoValuable {
    css() {
        return `
            :host {
                box-sizing: border-box;
                display: inline-block;
                width: .9em;
                height: .9em;
                border: .05em solid hsl(0 0 50/.75);
                border-radius: 50%;
                
                vertical-align: middle;
                line-height: 1.2em;
                
                overflow: hidden;
            }
            radio {
                display: block;
                width: 100%;
                height: 100%;
                outline: none;
            }
            radio.checked {
                background-color: hsl(211 100 50);
            }
            radio.checked::after {
                content: '';
                display: block;
                width: .4em;
                height: .4em;
                background-color: hsl(0 0 100);
                border-radius: 50%;
                position: relative;
                left: 50%;
                top: 50%;
                transform: translate(-50%,-50%) ;
            }
        `
    }
    htm() {
        return `
            <radio></radio>
        `
    }

    onCreation() {
        let radio = this.shadowRoot.querySelector('radio')
        radio.addEventListener('click', e=>{
            if (e.altKey) {
                this.setValue(this.radio.classList.remove('checked'))
                return
            }
            this.toggle()
            this.radio.focus()
        })
        radio.addEventListener('keypress', e=>{
            if (e.altKey) {
                this.setValue(this.radio.classList.remove('checked'))
                e.preventDefault()
                return
            }
            if (e.code == "Space") {
                this.toggle()
                e.preventDefault()
            }
        })
        this.radio = radio
        this.setAttribute('tabindex',0)
    }

    static get observedAttributes() { 
        return [...PiCoComponent.observedAttributes, 'checked', 'group']
    }

    get checked() { return this.radio.classList.contains('checked') }
    set checked(v) {
        v = v=='' || v=='true' || v=="yes"
        this.setValue(this.radio.classList.toggle('checked', v))
    }

    get group() { return this._group }
    set group(v) { this._group = v }

    toggle() {
        this.#unsetGroup()
        this.setValue(this.radio.classList.toggle('checked'))
    }

    #unsetGroup() {
        let parent = this.parentNode
        while (parent!=null && parent.tagName != 'BODY') {
            let gs = parent.getAttribute('group')
            if (gs) {
                gs = gs.split(',')
                if (gs.indexOf(this._group)!=-1) break
            }
            parent = parent.parentNode
        }
        if (parent == null) return
        let gs = parent.querySelectorAll(`pc-radio[group=${this._group}]`)
        gs.forEach(g=>{
            if (g.radio) {
                g.radio.classList.remove('checked')
                g.value = false
            }
        })
    }

}

try { customElements.define('pc-radio', PiCoRadio) } catch {}