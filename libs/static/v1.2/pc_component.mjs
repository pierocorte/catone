/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_component.mjs
 *  Description: Top Class of ths PiCo WebComponents Hierarchy
 */

import { inherits, kebabToCamel } from "../utils/utils.mjs";
import { Observer } from "../utils/mv.mjs";
import { PICO } from "./glob.mjs";
import { DAD } from "./dad.mjs";

const DEBUG = false
const log = DEBUG?console.log:()=>{}

export class PiCoComponent extends HTMLElement {
    constructor(focus=false) {
        super()
        this.attachShadow({mode:'open'})
        let template = document.createElement('template');
        template.innerHTML = this.template()
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.firstConnection = true
        this.onCreation()
        this.defaultConfig()
    }

    __init() {
        if (this.firstConnection) {
            this.firstConnection = false
            this.onFirstConnected()
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

    css() {return `
        :host {
            box-sizing: border-box;
            display: inline-block;
            width: 1em;
            height: 1em;
            border: .05em solid hsl(0 0 50/.50);
        }
    `}
    htm() {return `
    `}
    template() {return `
        <style>
            ${this.css()}
        </style>
        ${this.htm()}
    `}

    onCreation() { log(this.constructor.name, 'CREATED') }
    onFirstConnected() { log(this.constructor.name, 'FIRST CONNECTED') }
    onConnected() { log(this.constructor.name, 'CONNECTED') }
    onDisconnected() { log(this.constructor.name, 'DISCONNECTED') }
    onAdopted() { log(this.constructor.name, 'ADOPTED') }
    onAttributeChanged(name, oldValue, newValue) {
        log(this.constructor.name, 'ATTRIBUTE CHANGE')
        this[kebabToCamel(name)] = newValue
    }

    static get observedAttributes() {
        return ['pca-design', 'passive']
    }

    get pcaDesign() { return this._pcaDesign }
    set pcaDesign(v) {
        this._pcaDesign = v=="" || v=="true"
        if (this._pcaDesign) {
            this.setAttribute('pca-draggable','')
            DAD.setup(this, true)
        } else {
            this.removeAttribute('pca-draggable')
            this.unselect()
            DAD.setup(this, false)
        }
    }

    get passive() {return this._passive}
    set passive(v) {
        if (v==null && this._passive) {
            this._passive = false
            this.setAttribute('tabindex',0)
        } else {
            if (this.getAttribute('tabindex')!=null) {
                this._passive = true
                this.removeAttribute('tabindex')
            }
        }
    }

    toggleDesignMode() {
        if (this._pcaDesign) this.removeAttribute('pca-design')
        else this.setAttribute('pca-design','')
    }

    defaultConfig() {
        this._pico = {}
        let dragAction = this.getAttribute('pca-drag-action')
        if (dragAction==null || dragAction=='') this.setAttribute('pca-drag-action','move|copy')
        this.classList.add('pico-component')
        // this.addEventListener('click', e=>{
        //     console.log('CLICK', this._pcaDesign, PICO._dropping)
        //     if (!this._pcaDesign || PICO._dropping) {
        //         PICO._dropping = false
        //         e.stopImmediatePropagation()
        //         return
        //     }
        //     this.classList.toggle('selected')
        //     e.stopImmediatePropagation()
        // })
        this.addEventListener('keydown', e=>{
            if (!this._pcaDesign) return
            e.stopImmediatePropagation()
        })
        this.addEventListener('focus', e=>{
            e.preventDefault()
            e.stopImmediatePropagation()
            if (!this._pcaDesign) return
            e.target.blur()
        })
    }

    select() {
        PICO.lastSelected = this
        this.classList.add('selected')
    }
    unselect() {
        PICO.lastSelected = null
        this.classList.remove('selected')
    }
    toggleSelection() {
        if (this.classList.toggle('selected')) PICO.lastSelected = this
    }

    getDraggingElement() {
        return this
    }
    isDraggingCopyOnly() {
        return false
    }

    getEventNames() {
        return []
    }

    #model
    get model() { return this.#model}
    set model(m) {
        if (this.#model) this.ignore(this.#model)
        this.#model = m
        if (this.#model) this.observe(this.#model)
    }

    onDropping(container, child) {
        this.setAttribute('pca-design','')
        this.removeAttribute('slot')
        this.removeAttribute('passive')
        if (this._thumbnailClone) {
            delete this._thumbnailClone
            this.innerHTML = ''
        }
        if (child==container) container.appendChild(this)
        else container.insertBefore(this, child)
    }
    onDropOutside() {
        this.remove()
    }

}

inherits(PiCoComponent, Observer);

try { customElements.define('pc-component', PiCoComponent) } catch {}