/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_container.mjs
 *  Description: Top Class of the PiCo WebComponent-Containers Hierarchy
 */

import { PiCoComponent } from './pc_component.mjs'

export class PiCoContainer extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                display: inline-flex;
                width: fit-content;
                height: fit-content;
            }
            :host([pca-design]) {
                min-width: 1.5em;
                min-height: 1.5em;
                background-color: hsl(0 0 50/.5);
            }
        `
    }
    htm() {
        return `
            <slot name="content"></slot>
        `
    }

    onCreation() {
        Array.from(this.children).forEach(c => {
            let slot = c.getAttribute('slot')
            if (!slot) c.setAttribute('slot', 'content')
        })
    }

    appendChild(child, slot = 'content') {
        child.setAttribute('slot', slot)
        super.appendChild(child)
    }
    insertBefore(child, ref, slot = 'content') {
        child.setAttribute('slot', slot)
        super.insertBefore(child, ref)
    }
    replace(child, slot = 'content') {
        let c = Array.from(this.children).filter(el => el.getAttribute('slot') == slot)
        c.forEach(el => this.removeChild(el))
        this.appendChild(child, slot)
    }

    get pcaDesign() { return this._pcaDesign }
    set pcaDesign(v) {
        super.pcaDesign = v
        if (this._pcaDesign) {
            this.setAttribute('pca-droppable', '')
            // if (this.forceSpaces) setTimeout(()=>this.forceSpaces())
            Array.from(this.children).forEach(c => c.setAttribute('pca-design', ''))
        } else {
            this.removeAttribute('pca-droppable')
            // if (this.unforceSpaces) this.unforceSpaces()
            Array.from(this.children).forEach(c => c.removeAttribute('pca-design'))
        }
    }

    forcePadding(v) {
        let pad = parseInt(getComputedStyle(this).padding)
        if (pad != 0) return
        this.style.padding = v
        this._forcedPadding = true
    }
    unforcePadding() {
        if (!this._forcedPadding) return
        this.style.padding = 0
        this._forcedPadding = false
    }
    forceGap(v) {
        let gap = getComputedStyle(this).gap
        if (gap != 'normal') return
        this.style.gap = v
        this._forcedGap = true
    }
    unforceGap() {
        if (!this._forcedGap) return
        this.style.gap = 'normal'
        this._forcedGap = false
    }
    forceBorder(v) {
        let border = getComputedStyle(this).border
        if (border != '0px none rgb(0, 0, 0)') return
        this.style.border = v
        this._forcedBorder = true
    }
    unforceBorder() {
        if (!this._forcedBorder) return
        this.style.border = '0px none rgb(0, 0, 0)'
        this._forcedBorder = false
    }
    forceSpaces(v = '1em') {
        console.log('FORCE SPACES')
        this.forcePadding(v)
        this.forceGap(v)
        this.forceBorder('.1em solid hsl(0 0 50/.5)')
    }
    unforceSpaces() {
        console.log('UNFORCE SPACES')
        this.unforcePadding()
        this.unforceGap()
        this.unforceBorder()
    }
    getSlotNames() {
        const sns = this.shadowRoot.querySelectorAll('slot')
        return Array.from(sns).map(s => s.getAttribute('name'))
    }

}

try { customElements.define('pc-container', PiCoContainer) } catch { }