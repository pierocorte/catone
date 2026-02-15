/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_label.mjs
 *  Description: Component to realize a label
 */

import { PiCoComponent } from './pc_component.mjs'
import './pc_icon.mjs'

export class PiCoLiveDateTime extends PiCoComponent {
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
            <pc-icon name="schedule"></pc-icon>
            <label>22/10/2025, 09:38:15</label>
        `
    }

    onCreation() {
        const root = this.shadowRoot
        this.label = root.querySelector('label')

        const formatDate = new Intl.DateTimeFormat("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        setInterval(_ => {
            this.label.innerHTML = formatDate.format(new Date())
        }, 1000)

    }


}

try { customElements.define('pc-live-datetime', PiCoLiveDateTime) } catch { }