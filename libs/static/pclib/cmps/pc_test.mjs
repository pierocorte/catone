/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

// import { PICO } from './glob.mjs'
import { PiCoComponent } from './pc_component.mjs'

export class PiCoTest extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                position: relative;
                display: inline-grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 1em;
                gap: 1em;

                border: .5px solid var(--bdc); 
                border-radius: .25em;
            }
            :host(:focus) {
                outline: none;
            }
            pc-input, input {
                box-sizing: border-box;
                width: 6em;
                padding: .2em .5em;
                font-size: 1em;
            }
        `
    }
    htm() {
        return `
            <pc-input></pc-input>
            <pc-input></pc-input>
        `
    }

    onCreation() {
        const root = this.shadowRoot
        this.pcinputs = root.querySelectorAll('pc-input')
        this.inputs = root.querySelectorAll('input')
        this.focusables = root.querySelectorAll('[pca-focusable]')

        this.pcinputs.forEach((e, i) => {
            e.addEventListener('blur', e => {
                console.log('blur ' + i)
            })
            e.addEventListener('focus', e => {
                console.log('focus ' + i)
            })
        })
        this.inputs.forEach((e, i) => {
            e.addEventListener('blur', e => {
                console.log('blur ' + i)
            })
            e.addEventListener('focus', e => {
                console.log('focus ' + i)
            })
        })

    }

    _set_pcaDesign(v) {
        super._set_pcaDesign(v)
        this.focusables.forEach(e => {
            if (v != null) e.setAttribute('tabindex', -1)
            else e.removeAttribute('tabindex')
        })
    }
    _set_pcaDisabled(v) {
        super._set_pcaDisabled(v)
        this.focusables.forEach(e => {
            if (v != null) e.setAttribute('tabindex', -1)
            else e.removeAttribute('tabindex')
        })
    }


}

try { customElements.define('pc-test', PiCoTest) } catch { }