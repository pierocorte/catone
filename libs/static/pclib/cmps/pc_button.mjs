/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

import { Action } from '../utils/Action.mjs'
import { PiCoComponent } from './pc_component.mjs'

export class PiCoButton extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                --fill: 0;
                --weight: 300;
                --grade: 0;
                --optical: 24;

                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-direction: row;
                                    
                border-radius: .25em;
                padding: 0em 1em;
                width: fit-content;
                height: fit-content;
                min-width: 6em;

                background-color: var(--btn-bgc);
                color: var(--btn-fgc);

                outline: none;
                overflow: hidden;
            }
            :host(:active) {
                background-color: var(--btn-hlc);
            }
            :host(.disabled) {
                background-color: var(--btn-disc);
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
                background-color: hsla(0, 0%, 100%, 0.5);
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
            @keyframes spin {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }

        `
    }
    htm() {
        return `
            <icon part="icon">home</icon>
            <text part="text">Button</text>
        `
    }

    onCreation() {
        const root = this.shadowRoot
        this.icona = root.querySelector('icon')
        this.testo = root.querySelector('text')


        this.addEventListener('click', e => {
            if (this._pcaDesign || this.disabled) return
            this.click(e)
        })
        this.addEventListener('keydown', e => {
            if (this._pcaDesign) return
            if (e.code == "Space") {
                this.click(e)
            }
        })
    }
    onInitialization() {
        this.setAttribute('pca-focusable', '')
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'text', 'icon', 'action-name', 'disabled']
    }
    _set_text(v) {
        this.testo.innerHTML = v
    }
    _set_icon(v) {
        this.icona.innerHTML = v
        if (v != null) this.icona.classList.add('visible')
        else this.icona.classList.remove('visible')
    }
    _set_actionName(v) {
        this._actionName = v
    }
    _set_disabled(v) {
        this._disabled = (v != null)
        if (this._disabled) this.classList.add('disabled')
        else this.classList.remove('disabled')
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
        if (!e) e = {}
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        let cx = e.clientX || rect.left + rect.width / 2
        let cy = e.clientY || rect.top + rect.height / 2
        ripple.style.left = `${cx - rect.left - size / 2}px`;
        ripple.style.top = `${cy - rect.top - size / 2}px`;
        ripple.classList.add('ripple');
        this.shadowRoot.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }

    set model(action) {
        if (action != null && !(action instanceof Action)) return
        super.setModel(action)
    }

    notified(source, event) {
        if (event.disabled != undefined) {
            this.style.backgroundColor = event.disabled ? 'hsl(0 0 50)' : 'hsl(210 100 50)';
            if (event.disabled) this.removeAttribute('focusable')
            else this.setAttribute('focusable', '')
        }
        if (event.name != undefined)
            console.log(`BUTTON NAME ${this.constructor.name}:`, event.name)
    }

    getEventNames() {
        return ['action']
    }

}

try { customElements.define('pc-button', PiCoButton) } catch { }