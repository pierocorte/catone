/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_flex_layout.mjs
 *  Description: Component to realize a container with a FLEX layout manager
 */

import { PiCoComponent } from './pc_component.mjs'
import { PiCoContainer } from './pc_container.mjs'

export class PiCoFlexLayout extends PiCoContainer {
    css() {
        return `
            :host {
                box-sizing: border-box;
                position: relative;
                display: flex;
                flex-flow: column wrap;
                align-content: unset;
                justify-content: unset;
                gap: .5em;

                background-color: inherit;
                color:inherit;

                border: .05em solid hsl(0 0 50);
                --border-radius: unset;

                padding: .5em;
                margin: 0;

                align-items: center;  /* funziona anche con il parent grid */

                -webkit-user-select: none; /* Safari/iOS */
                -ms-user-select: none;     /* IE/Edge */
                user-select: none;
                vertical-align: middle;
                line-height: 1.2em;

                width: 100%;
                height: fit-content;
                --flex: 0 0 fit-content;
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

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'direction']
    }

    get direction() { return this.style.flexDirection }
    set direction(v) { this.style.flexDirection = v }

}


try { customElements.define('pc-flex-layout', PiCoFlexLayout) } catch {}