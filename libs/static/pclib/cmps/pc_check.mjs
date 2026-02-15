/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

import { PiCoValuable } from './pc_valuable.mjs'

export class PiCoCheck extends PiCoValuable {
    css() {
        return super.css() + `
            :host {
                width: .9em;
                height: .9em;
                border: .5px solid hsl(0 0 50/.75);
                border-radius: .25em;
                
                overflow: hidden;
                cursor: pointer;
            }
            check {
                display: block;
                width: 100%;
                height: 100%;
                outline: none;
            }
            check.checked {
                background-color: hsl(211 100 50);
            }
            check.checked::after {
                content: '';
                display: block;
                width: .2em;
                height: .5em;
                border: solid white;
                border-width: 0 .12em .12em 0;
                border-radius: .2em;
                border-end-start-radius: .1em;
                border-start-end-radius: .1em;
                position: relative;
                left: 50%;
                top: 45%;
                transform: translate(-50%,-50%) rotate(45deg) ;
            }
        `
    }
    htm() {
        return `
            <check></check>
        `
    }

    onCreation() {
        const root = this.shadowRoot
        this.check = root.querySelector('check')
        this.addEventListener('blur', e => {
            this._oldValue = this._value
            this._fireBlur()
        })
        this.addEventListener('keypress', e => {
            if (e.code == "Space") {
                this.click()
                e.preventDefault()
            }
        })
        this.value = false
    }
    onInitialization() {
        this.check.addEventListener('click', e => {
            this.click()
        })
        this.setAttribute('pca-focusable', '')
    }

    get value() { return super.value }
    set value(v) {
        super.value = v
        if (v === 'true' || v === true || v === 'yes') this.check.classList.add('checked')
        else this.check.classList.remove('checked')
        return v
    }

    toggle(v) {
        if (v === undefined) v = !this.check.classList.contains('checked')
        this.setValue(v)
        this.check.classList.toggle('checked', v)
        return v
    }

    click() {
        this.setValue(this.check.classList.toggle('checked'))
    }


}

try { customElements.define('pc-check', PiCoCheck) } catch { }