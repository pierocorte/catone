/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_label.mjs
 *  Description: Component to realize a label
 */

import { PiCoComponent } from 'http://localhost:3000/lib/v1.2/pc_component.mjs';

export class MCLabel extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2em;
                font-weight: 600;
                color: white;
                white-space: nowrap;
                width: fit-content;
                height: fit-content;
            }
        `
    }
    htm() {
        return `
            MC-LABEL
        `
    }
}

try { customElements.define('mc-label', MCLabel) } catch { }