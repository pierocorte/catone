/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

import { PiCoComponent } from '../cmps/pc_component.mjs'
import { PiCoContainer } from '../cmps/pc_container.mjs'

export class XPocket extends PiCoContainer {
    css() {
        return super.css() + `
            :host {
                position: relative;
                display: flex;
                flex-direction: column;
            }
            :host(:focus) {
                outline: none;
            }
            content {
                height: 0;
                overflow: hidden;
                transition: height .3s;
            }
        `
    }
    htm() {
        return `
            <control><slot name="control"></slot></control>
            <content>${super.htm()}</content>
        `
    }

    onCreation() {
        const root = this.shadowRoot
        this.control = root.querySelector('control')
        this.content = root.querySelector('content')
        this.content.style.height = 0
        root.addEventListener('click', e => {
            let o = this.children[0].value
            this.toggleContent(o)
        })
    }


    toggleContent(open) {
        if (open == undefined) open = this.content.style.height != '0px'
        if (open) {
            this.contentHeight = this.contentHeight || this.content.scrollHeight
            this.content.style.height = this.contentHeight + 'px'
            this.content.style.overflow = 'visible'
        } else {
            this.content.style.height = 0
            this.content.style.overflow = 'hidden'
        }
    }

    _open() {
        this.contentHeight = 26
        this.content.style.height = this.contentHeight + 'px'
        this.content.style.overflow = 'visible'
    }

}

try { customElements.define('x-pocket', XPocket) } catch { }