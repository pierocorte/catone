/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

import { PiCoComponent } from './pc_component.mjs'
import { PiCoValuable } from './pc_valuable.mjs'

export class PiCoCheck extends PiCoValuable {
    css() {
        return `
            :host {
                box-sizing: border-box;
                display: inline-block;
                width: .9em;
                height: .9em;
                border: .05em solid hsl(0 0 50/.75);
                border-radius: .25em;
                
                vertical-align: middle;
                line-height: 1.2em;
                
                overflow: hidden;
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
        let check = this.shadowRoot.querySelector('check')
        check.addEventListener('click', e=>{
            this.toggle()
            this.check.focus()
        })
        check.addEventListener('keypress', e=>{
            if (e.code == "Space") {
                this.toggle()
                e.preventDefault()
            }
        })
        this.check = check
        this.setAttribute('tabindex',0)
    }

    static get observedAttributes() { 
        return [...PiCoComponent.observedAttributes, 'checked']
    }

    get checked() { return this.check.classList.contains('checked') }
    set checked(v) {
        v = v=='' || v=='true' || v=="yes"
        this.setValue(this.check.classList.toggle('checked', v))
    }

    toggle() {
        this.setValue(this.check.classList.toggle('checked'))
    }

}

try { customElements.define('pc-check', PiCoCheck) } catch {}