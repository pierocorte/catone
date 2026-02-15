/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: PCApp.mjs
 *  Description: App Widget - The root widget of the application
 */


import { PiCoComponent } from '../cmps/pc_component.mjs';
import { PiCoContainer } from '../cmps/pc_container.mjs';

export class PiCoBorderLayout extends PiCoContainer {
    css() {
        return super.css() + `
            :host {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            header, footer {
                display: none;
                width: 100%;
                overflow: hidden;
            }
            middle {
                box-sizing: border-box;
                display: flex;
                flex: 1;
                width: 100%;
                overflow: hidden;
            }
            leftbar, rightbar {
                display: none;
                overflow: hidden;
            }
            content {
                flex: 1;
                width: 100%;
                overflow: hidden;
            }
        `
    }
    htm() {
        return `
            <header><slot name="header"></slot></header>
            <middle>
                <leftbar><slot name="leftbar"></slot></leftbar>
                <content><slot name="content"></content>
                <rightbar><slot name="rightbar"></slot></rightbar>
            </middle>
            <footer><slot name="footer"></slot></footer>
        `
    }

    onCreation() {
        super.onCreation()
        const root = this.shadowRoot
        this.splash = root.querySelector('splash')
        this.header = root.querySelector('header')
        this.footer = root.querySelector('footer')
        this.leftbar = root.querySelector('leftbar')
        this.rightbar = root.querySelector('rightbar')
        this.content = root.querySelector('content')
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'header', 'footer', 'leftbar', 'rightbar']
    }
    _set_header(v) {
        this.header.style.display = v == 'on' ? 'block' : 'none'
    }
    _set_footer(v) {
        this.footer.style.display = v == 'on' ? 'block' : 'none'
    }
    _set_leftbar(v) {
        this.leftbar.style.display = v == 'on' ? 'block' : 'none'
    }
    _set_rightbar(v) {
        this.rightbar.style.display = v == 'on' ? 'block' : 'none'
    }

}

try { customElements.define('pc-border-layout', PiCoBorderLayout) } catch { }