/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_flex_layout.mjs
 *  Description: Component to realize a container with a FLEX layout manager
 */

import { PiCoComponent } from './pc_component.mjs'
import { PiCoContainer } from './pc_container.mjs'

export class PiCoLayeredContainer extends PiCoContainer {
    css() {
        return `
            :host {
                box-sizing: border-box;
                position: relative;
                display: block;
                overflow: hidden;
                vertical-align: middle;
                line-height: 1.4em;
                background-color: hsl(0 50 50/.5);
                color:inherit;
                border: .05em solid hsl(0 0 50);

                -webkit-user-select: none; /* Safari/iOS */
                -ms-user-select: none;     /* IE/Edge */
                user-select: none;

                width: 100%;
                height: 100%;
            }
        `
    }
    htm() {
        return `
            <slot name="content"></slot>
        `
    }

    onCreation() {
        Array.from(this.children).forEach(c=>{
            c.setAttribute('slot','content')
            c.style.position = 'absolute'
            c.style.boxSizing = 'border-box'
            c.style.left = 0;
            c.style.top = 0;
            c.style.width = '100%';
            c.style.height = '100%';
        })
    }

}


try { customElements.define('pc-layered-container', PiCoLayeredContainer) } catch {}