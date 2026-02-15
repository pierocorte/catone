/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: PCApp.mjs
 *  Description: App Widget - The root widget of the application
 */


import { PiCoContainer } from '../cmps/pc_container.mjs';

export class PiCoViewport extends PiCoContainer {
    css() {
        return super.css() + `
            :host {
                position: relative;
                box-sizing: border-box;
                display: block;
                width: 100%;
                height: 100%;
                border: 0px solid var(--bdc);
                outline: none!important;
                overflow: hidden;
                padding: .7em;
                flex: 1;
            }
            content {
                box-sizing: border-box;
                display: block;
                width: 100%;
                height: 100%;
                overflow: auto;
            }
        `
    }
    htm() {
        return `
            <content part="content">${super.htm()}</content>
        `
    }
}

try { customElements.define('pc-viewport', PiCoViewport) } catch { }