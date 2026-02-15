/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_label.mjs
 *  Description: Component to realize a label
 */

import { PiCoComponent } from 'http://localhost:3000/lib/pclib/cmps/pc_component.mjs';
import { PiCoWin } from 'http://localhost:3000/lib/pclib/cmps/pc_win.mjs';


export class MCLabel extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1em;
                font-weight: 600;
                color: white;
                white-space: nowrap;
                width: 100%;
                height: fit-content;
            }
            panel {
                flex: 1;
                display: flex;
                flex-direction: column;
                border: 3px solid orange;
            }

        `
    }
    htm() {
        return `
            <panel>
                MC-LABEL
            </panel>
        `
    }
    onCreation() {
        const root = this.shadowRoot
        this.addEventListener('dblclick', e => {
            this.dock()
        })
    }

    dock() {
        this.$parent = this.parentElement
        if (!this.$win) {
            const win = new PiCoWin
            win.style.left = '100px'
            win.style.top = '100px'
            win.addEventListener('close', e => {
                this.$parent.appendChild(this)
            })
            document.body.appendChild(win)
            this.$win = win
        }
        this.$win.appendChild(this)
        this.$win.show()
    }

}

try { customElements.define('mc-label', MCLabel) } catch { }