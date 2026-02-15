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
        return super.css() + `
            :host {
                width: .9em;
                height: .9em;
                border: .5px solid hsl(0 0 50/.75);
                border-radius: 50%;
                            
                overflow: hidden;
                cursor: pointer;
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
        const root = this.shadowRoot
        this.radio = root.querySelector('radio')
        this.addEventListener('blur', e => {
            setTimeout(() => {
                this._oldValue = this._value
                this._fireBlur()
            }, 0)
        })
        this.addEventListener('keypress', e => {
            if (e.altKey) {
                this.setValue(this.radio.classList.remove('checked'))
                e.preventDefault()
                return
            }
            if (e.code == "Space") {
                this.click()
                e.preventDefault()
            }
        })

    }

    onInitialization() {
        this.radio.addEventListener('click', e => {
            if (e.altKey) {
                this.#unsetGroup()
                this._fireBlur()
                // this.setValue(this.radio.classList.remove('checked'))
                return
            }
            this.click()
        })
        this.setAttribute('pca-focusable', '')
    }

    static get observedAttributes() {
        return [...PiCoValuable.observedAttributes, 'group']
    }
    _set_group(v) { this.__group = v }

    get value() { return super.value }
    set value(v) {
        super.value = v
        if (v === 'true' || v === true || v === 'yes') this.radio.classList.add('checked')
        else this.radio.classList.remove('checked')
        return v
    }


    click() {
        const isCheked = this.radio.classList.contains('checked')
        if (this.value && isCheked) return
        this.#unsetGroup()
        this.setValue(this.radio.classList.toggle('checked'))
    }

    #unsetGroup() {
        let parent = this.parentNode
        while (parent != null && parent.tagName != 'BODY') {
            let gs = parent.getAttribute('group')
            if (gs) {
                gs = gs.split(',')
                if (gs.indexOf(this.__group) != -1) break
            }
            parent = parent.parentNode
        }
        if (parent == null) return
        let gs = parent.querySelectorAll(`pc-radio[group=${this.__group}]`)
        gs.forEach(g => {
            if (g.radio) {
                g.radio.classList.remove('checked')
                g.value = false
            }
        })
    }

}

try { customElements.define('pc-radio', PiCoRadio) } catch { }