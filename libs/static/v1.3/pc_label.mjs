/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_label.mjs
 *  Description: Component to realize a label
 */

import { PiCoComponent } from './pc_component.mjs'

export class PiCoLabel extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            main {
                white-space: nowrap;        
                overflow: hidden;
                text-overflow: ellipsis;
            }
        `
    }
    htm() {
        return `
            <main></main>
        `
    }

    onCreation() {
        this.main = this.shadowRoot.querySelector('main')
        this.main.innerHTML = this.innerHTML || 'Label'
        this.innerHTML = ''
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'text', 'size']
    }

    get text() { return this.main.innerHTML }
    set text(v) {
        this.main.innerHTML = v
    }

    get size() { return this.main.style.fontSize }
    set size(v) { this.main.style.fontSize = v }

}

try { customElements.define('pc-label', PiCoLabel) } catch { }