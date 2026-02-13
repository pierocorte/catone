/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

import { Action } from './Action.mjs'
import { PiCoComponent } from './pc_component.mjs'

export class PiCoButton extends PiCoComponent {
    css() {
        return `
            :host {
                --fill: 0;
                --weight: 300;
                --grade: 0;
                --optical: 24;

                box-sizing: border-box;
                vertical-align: middle;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-flow: column-reverse;
                width: fit-content;
                height: fit-content;
                min-width: fit-content;
                min-height: fit-content;
                                    
                line-height: 1.4em;
                border: .05em solid transparent;
                border-radius: .25em;
                padding: 0em 1em;
                background-color: hsl(210 100 50);
                color: hsl(0 0 100);
                outline: none;
                overflow: hidden;

                -webkit-user-select: none; /* Safari/iOS */
                -ms-user-select: none;     /* IE/Edge */
                user-select: none;
            }
            :host(:focus) {
                outline: 3px solid hsl(220 80 50/.5);
                outline-offset: 0;
            }
            text {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                cursor: inherit;
            }
            icon {
                font-family: SymbolsRounded;
                font-variation-settings: 'FILL' var(--fill), 'GRAD' var(--grade), 'opsz' var(--optical), 'wght' var(--weight);
                display: none;
            }
            icon.visible {
                display: block;
            }
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: hsl(0 0 100/.5);
                transform: scale(0);
                animation: ripple-animation 600ms linear;
                pointer-events: none;
            }
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `
    }
    htm() {
        return `
            <icon part="icon">home</icon>
            <text part="text"></text>
        `
    }

    onCreation() {
        this.icona = this.shadowRoot.querySelector('icon')
        this.testo = this.shadowRoot.querySelector('text')
        //this.testo.innerHTML = this.innerHTML || "Button"
        //this.innerHTML = ''
        this.setAttribute('tabindex', 0)
        this.style.position = 'relative'

        this.addEventListener('click', e => {
            if (this._pcaDesign) return
            this.click(e)
        })
        this.addEventListener('keydown', e=>{
            if (this._pcaDesign) return
            if (e.code == "Space") {
                this.click(e)
            }
        })
    }

    static get observedAttributes() { 
        return [...PiCoComponent.observedAttributes,'icon','text','action-name']
    }

    get text() { return this.testo.innerHTML }
    set text(v) { 
        this.testo.innerHTML = v
    }

    get icon() { return this.icona.innerHTML }
    set icon(v) { 
        this.icona.innerHTML = v
        if (v!=null) this.icona.classList.add('visible')
        else this.icona.classList.remove('visible')
    }

    get actionName() { return this._actionName }
    set actionName(v) { 
        this._actionName = v
    }


    click(e) {
        if (this.model && this.model.disabled) return
        let ne = new Event('action', e)
        ne.action = this.model ? this.model.name : this._actionName
        if (this.model) {
            if (this.model.disabled) return
            else this.model.call(ne)
        }
        this.#ripple(e)
        this.dispatchEvent(ne)
    }

    #ripple(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        let cx = e.clientX || rect.left + rect.width/2
        let cy = e.clientY || rect.top + rect.height/2
        ripple.style.left = `${cx - rect.left - size / 2}px`;
        ripple.style.top = `${cy - rect.top - size / 2}px`;
        ripple.classList.add('ripple');
        this.shadowRoot.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }

    set model(action) {
        if (action!=null && !(action instanceof Action)) return
        super.setModel(action)
    }

    notified(source,event) {
        if (event.disabled != undefined) {
            this.style.backgroundColor = event.disabled ? 'hsl(0 0 50)' : 'hsl(210 100 50)';
            if (event.disabled) this.removeAttribute('focusable')
            else this.setAttribute('focusable','')
        }
        if (event.name != undefined)
            console.log(`BUTTON NAME ${this.constructor.name}:`, event.name)
    }

    getEventNames() {
        return ['action']
    }

}

try { customElements.define('pc-button', PiCoButton) } catch {}