/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_component.mjs
 *  Description: Top Class of ths PiCo WebComponents Hierarchy
 */

import { inherits, kebabToCamel } from "../utils/utils.mjs";
import { Observer } from "../utils/mv.mjs";
import { DAD } from "../utils/dad.mjs";

const DEBUG = false
const log = DEBUG ? console.log : () => { }

export class PiCoComponent extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        let template = document.createElement('template');
        template.innerHTML = this.template()
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.initialization = true
        this.onCreation()
        this.defaultConfig()
    }

    __init() {
        if (this.initialization) {
            this.initialization = false
            this.onInitialization()
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // log('Custom element attribute changed.')
        this.__init()
        this.onAttributeChanged(name, oldValue, newValue)
    }
    connectedCallback() {
        // log('Custom element added to page.')
        this.__init()
        this.onConnected()
    }
    disconnectedCallback() {
        // log('Custom element removed from page.');
        this.onDisconnected()
    }
    adoptedCallback() {
        // log('Custom element moved to a new page.');
        this.onAdopted()
    }

    css() {
        return `
        :host {
            position: relative;
            box-sizing: border-box;
            display: inline-block;
            line-height: 1.5em;
            vertical-align: middle;

            -webkit-user-select: none;  /* Safari/iOS */
            -ms-user-select: none;      /* IE/Edge */
            user-select: none;

            border: .5px solid transparent;
        }
        :host(:focus) {
            outline: 3px solid hsla(220, 80%, 50%,.5);
            outline-offset: 0;
        }
        :host(.selected) {
            outline: 3px solid hsl(30 80 50/.5);
            outline-offset: 0;
        }
        :host(.disabled) {
            background-color: var(--btn-disc);
            pointer-events: none;
            touch-action: none;
        }
    `}
    htm() {
        return `pc-component`
    }
    template() {
        return `
        <style>
            ${this.css()}
        </style>
        ${this.htm()}
    `}

    onCreation() { log(this.constructor.name, 'CREATED') }
    onInitialization() { log(this.constructor.name, 'INITIALIZED') }
    onConnected() { log(this.constructor.name, 'CONNECTED') }
    onDisconnected() { log(this.constructor.name, 'DISCONNECTED') }
    onAdopted() { log(this.constructor.name, 'ADOPTED') }
    onAttributeChanged(name, oldValue, newValue) {
        if (oldValue === newValue) return
        log(this.constructor.name, 'ATTRIBUTE CHANGED', name, `'${oldValue}' '${newValue}'`)
        const setter = this['_set_' + kebabToCamel(name)]
        if (setter) setter.bind(this)(newValue)
    }

    static get observedAttributes() {
        return ['pca-focusable', 'pca-design', 'pca-disabled']
    }
    _set_pcaDesign(v) {
        this.__pcaDesign = v == "" || v == "true"
        if (this.__pcaDesign) {
            this.setAttribute('pca-draggable', '')
            DAD.setup(this, true)
        } else {
            this.removeAttribute('pca-draggable')
            this.unselect()
            DAD.setup(this, false)
        }
    }
    _set_pcaDisabled(v) {
        this._disabled = (v != null)
        if (this._disabled) {
            this.classList.add('disabled')
        } else {
            this.classList.remove('disabled')
        }
    }


    hide() {
        this.style.display = 'none'
    }
    show() {
        this.style.display = this._defaultDisplay || 'flex'
    }

    toggleDesignMode() {
        if (this.__pcaDesign) this.removeAttribute('pca-design')
        else this.setAttribute('pca-design', '')
    }

    defaultConfig() {
        this._pico = {}
        let dragAction = this.getAttribute('pca-drag-action')
        if (dragAction == '') this.setAttribute('pca-drag-action', 'move|copy')
        this.classList.add('pico-component')
        this.addEventListener('keydown', e => {
            if (!this.__pcaDesign && !this._disabled) return
            e.preventDefault()
            e.stopImmediatePropagation()
        }, true)
        this.addEventListener('click', e => {
            if (!this.__pcaDesign && !this._disabled) return
            e.preventDefault()
            e.stopImmediatePropagation()
        }, true)
    }
}

inherits(PiCoComponent, Observer);

try { customElements.define('pc-component', PiCoComponent) } catch { }