/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

import { PICO } from './glob.mjs'
import { PiCoComponent } from './pc_component.mjs'
import { PiCoValuable } from './pc_valuable.mjs'

export class PiCoSelect extends PiCoValuable {
    css() {
        return `
            :host {
                --placeholder-color: hsl(0 0 50/.75);
                --placeholder-font-style: italic;
        
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
                height: 1.4em;
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
            content {
                flex: 1 1 0;
                line-height: 1.2em;
                text-wrap: nowrap;
                outline: none;
                overflow: auto;
                scrollbar-width: none;      /* Firefox */
                -ms-overflow-style: none;   /* IE 10+ */
            }
            content::-webkit-scrollbar {
                display: none;              /* Chrome, Safari */
            }
            content:empty:before {
                content: attr(placeholder);
                color: var(--placeholder-color);
                font-style: var(--placeholder-font-style);
                pointer-events: none;
            }
            content:focus:before {
                content: '';
            }
            popup {
                position: relative;
                display: none;
                place-content: center;
                background-color: hsl(0 70 50);
                color: hsl(0 0 90);
                border-radius: 50%;
                width: 1em;
                height: 1em;
                font-size: .75em;
                cursor: pointer;
                outline: none;
                margin: .1em;
            }
        `
    }
    htm() {
        return `
            <content contenteditable>select</content>
        `
    }

    onCreation() {
        this.content = this.shadowRoot.querySelector('content')
        this.popup = this.shadowRoot.querySelector('popup')
        
    }

    static get observedAttributes() { 
        return [...PiCoComponent.observedAttributes,'value','placeholder']
    }

    get passive() {return this.content.getAttribute('contenteditable')}
    set passive(v) {
        if (v==null) this.content.setAttribute('contenteditable','')
        else this.content.removeAttribute('contenteditable')
    }

    get value() { return super.value }
    set value(v) {
        v = v==undefined?'':v
        this.content.innerHTML = v
        super.value = v
        if (this.model) this.model.value = v
    }
    getValue() { return super.getValue() }
    setValue(v) {
        v = v==undefined?'':v
        this.content.innerHTML = v
        super.setValue(v)
        if (v!='' && !this.validate(v)) {
            let ne = new Event('error', {bubbles:true})
            ne.value = v
            ne.error = this._error
            this.dispatchEvent(ne)
            this.shadowRoot.querySelector('error').style.display = 'grid'
        }
    }

    get model() {return super.model}
    set model(m) {
        super.model = m
        this.value = m.value
    }

    notified(source, event) {
        this.setValue(event.value)
    }
    
    get placeholder() { return this.content.getAttribute('placeholder') }
    set placeholder(v) {
        this.content.setAttribute('placeholder', v)
    }
}

try { customElements.define('pc-select', PiCoSelect) } catch {}