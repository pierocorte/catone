/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_flex_layout.mjs
 *  Description: Component to realize a container with a FLEX layout manager
 */

import { PiCoComponent } from './pc_component.mjs'
import { PiCoContainer } from './pc_container.mjs'

export class PiCoGridLayout extends PiCoContainer {
    css() {
        return `
            :host {
                box-sizing: border-box;
                position: relative;
                display: grid;
                --align-content: unset;
                --justify-content: unset;
                --gap: .25em;
                place-content: center;

                --grid-template-columns: repeat(1, 1fr);
                --grid-template-rows: repeat(1, 1fr);

                background-color: inherit;
                color:inherit;

                --border: .05em solid hsl(0 0 50);
                --border-radius: inherit;

                --padding: .25em;
                margin: 0;

                --align-items: unset;  /* funziona anche con il parent grid */

                -webkit-user-select: none; /* Safari/iOS */
                -ms-user-select: none;     /* IE/Edge */
                user-select: none;
                vertical-align: middle;
                line-height: 1.2em;

                width: fit-content;
                height: fit-content;
                flex: 0 0 fit-content;

            }
        `
    }
    htm() {
        return `
            <slot name="content"></slot>
        `
    }

    onCreation() {
        Array.from(this.children).forEach(c=>c.setAttribute('slot','content'))
    }

}


try { customElements.define('pc-grid-layout', PiCoGridLayout) } catch {}