/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_container.mjs
 *  Description: Top Class of the PiCo WebComponent-Containers Hierarchy
 */

import { DAD } from '../utils/dad.mjs'
import { PiCoComponent } from './pc_component.mjs'
import { PiCoContainer } from './pc_container.mjs'

export class PiCoListContainer extends PiCoContainer {
    css() {
        return super.css() + `
            :host {
                flex-direction: column;
                border-color: var(--bdc);
                height: 9em;
            }
        `
    }
    htm() {
        return super.htm() + `
        `
    }

    onInitialization() {
        setTimeout(_ => {
            Array.from(this.children).forEach(c => {
                let bb = this.getBoundingClientRect()
                DAD.setup(c, true, { force: 'vertical', minY: bb.top - 3, maxY: bb.bottom - 27 })
            })
        })
    }
}

try { customElements.define('pc-list-container', PiCoListContainer) } catch { }