/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_label.mjs
 *  Description: Component to realize a label
 */

import { PiCoComponent } from './pc_component.mjs'

export class PiCoIcon extends PiCoComponent {
    css() {
        return `
            :host {
                --fill: 0;
                --weight: 300;
                --grade: 0;
                --optical: 24;

                box-sizing: border-box;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                
                vertical-align: middle;
                line-height: 1.5em;
                width: 1.5em;
                height: 1.5em;

                -webkit-user-select: none; /* Safari/iOS */
                -ms-user-select: none;     /* IE/Edge */
                user-select: none;

                font-family: SymbolsRounded;
                font-variation-settings: 'FILL' var(--fill), 'GRAD' var(--grade), 'opsz' var(--optical), 'wght' var(--weight);
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
        //this.setAttribute('name', this.innerHTML || 'home')
        this.main.innerHTML = this.innerHTML || 'home'
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'name', 'size', 'fill', 'weight', 'grade', 'optical', 'transform']
    }

    get name() { return this.main.innerHTML }
    set name(v) { this.main.innerHTML = v }

    get size() { return this.main.style.fontSize }
    set size(v) { this.main.style.fontSize = v }

    get transform() { return this.main.style.trasform }
    set transform(v) { this.main.style.transform = v }

    get fill() { return getComputedStyle(this).getPropertyValue('--weight').trim() }
    set fill(v) {
        if (v != 0 && v != 1) return
        this.style.setProperty('--fill', v)
    }

    get weight() { return getComputedStyle(this).getPropertyValue('--weight').trim() }
    set weight(v) {
        if (v < 100 && v > 700) return
        this.style.setProperty('--weight', v)
    }

    get grade() { return getComputedStyle(this).getPropertyValue('--weight').trim() }
    set grade(v) {
        if (v != -25 && v != 0 && v != 200) return
        this.style.setProperty('--grade', v)
    }

    get optical() { return getComputedStyle(this).getPropertyValue('--weight').trim() }
    set optical(v) {
        if (v != 20 && v != 24 && v != 40 && v != 48) return
        this.style.setProperty('--optical', v)
    }
}

try { customElements.define('pc-icon', PiCoIcon) } catch { }