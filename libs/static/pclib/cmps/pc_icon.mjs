/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_label.mjs
 *  Description: Component to realize a label
 */

import { PiCoComponent } from './pc_component.mjs'

export class PiCoIcon extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                --fill: 0;
                --weight: 300;
                --grade: 0;
                --optical: 24;

                display: inline-flex;
                align-items: center;
                justify-content: center;
                
                width: calc(1.5em + 1px);

                font-family: SymbolsRounded;
                font-variation-settings: 'FILL' var(--fill), 'GRAD' var(--grade), 'opsz' var(--optical), 'wght' var(--weight);
            }
        `
    }
    htm() {
        return `
            <main part="icon"></main>
        `
    }

    onCreation() {
        const root = this.shadowRoot
        this.main = root.querySelector('main')
        this.main.innerHTML = this.innerHTML || 'home'
        this.innerHTML = ''
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'name', 'size', 'transform', 'fill', 'weight', 'grade', 'optical']
    }
    _set_name(v) { this.main.innerHTML = v }
    _set_size(v) { this.main.style.fontSize = v }
    _set_transform(v) { this.main.style.transform = v }
    _set_fill(v) {
        if (v != 0 && v != 1) return
        this.style.setProperty('--fill', v)
    }
    _set_weight(v) {
        if (v < 100 && v > 700) return
        this.style.setProperty('--weight', v)
    }
    _set_grade(v) {
        if (v != -25 && v != 0 && v != 200) return
        this.style.setProperty('--grade', v)
    }
    _optical(v) {
        if (v != 20 && v != 24 && v != 40 && v != 48) return
        this.style.setProperty('--optical', v)
    }
}

try { customElements.define('pc-icon', PiCoIcon) } catch { }