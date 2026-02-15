import { PiCoComponent } from "../cmps/pc_component.mjs";
import { XModal } from "./x_modal.mjs";

export class XBlock extends PiCoComponent {
    css() {
        return `
            :host {
                position: absolute;
                display: flex;
                transform-style: preserve-3d;
                background-color: hsla(140, 100%, 50%, .5);
                width: 100px;
                height: 50px;
            }
            .face {
                box-sizing: border-box;
                position: absolute;
                display: grid;
                place-content: center;
                border: 1px solid hsla(0, 0%, 100%, .7);
                background-color: hsla(200, 100%, 50%, .2);
                text-align: center;
            }
            top,front,left,back,right,bottom{
                width: 100%;
                height: 100%;
                color: white;
                font-size: .8em;
                line-height: 1.1em;
            }
            top[selectable]:hover {
                background-color: hsla(50, 80%, 50%, 0.7);
                color: black;
            }
            top[selectable]:active {
                background-color: hsla(50, 80%, 50%, 0.9);
                color: black;
            }
            filler {
                position: absolute;
                display: none;
                width: 50%;
                height: 50%;
                background-color: hsla(0,100%,50%,.5);
                left: 50%;
                top:50%;
                transform: translate(-50%,-50%);
            }
            name, val {
                pointer-events: none;
                color: hsl(0, 0%, 100%);
            }
            name {
                font-size: 1.2em;
                font-weight: bold;
            }
            
        `
    }
    htm() {
        return `
            <filler></filler>
            <top class="face"><name></name><val></val></top>
            <front class="face"></front>
            <left class="face"></left>
            <back class="face"></back>
            <right class="face"></right>
        `
    }

    onCreation() {
        const root = this.shadowRoot
        this.filler = root.querySelector('filler')
        this.faces = root.querySelectorAll('.face')
        this.name = root.querySelector('name')
        this.val = root.querySelector('val')
        this.initialize()
        this.faces[0].addEventListener('click', e => {
            if (this._selectable != null) {
                this.dispatchEvent(new CustomEvent('block-selected', { detail: { name: this.getAttribute('name') } }))
            }
        })
    }

    initialize() {
        this._set_position('0,0,0')
        this._set_size('27,27,27')
    }
    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'position', 'size', 'scale', 'fill', 'selectable', 'name', 'val', 'background']
    }
    _set_position(v) {
        const [x, y, z] = v.split(',')
        this._position = [x, y, z]
        this.style.transform = `translate3d(${x}px,${y}px,${z}px)`
    }
    _set_size(v) {
        const [w, l, h] = v.split(',')
        this._size = [w, l, h]
        this.style.width = w + 'px'
        this.style.height = l + 'px'
        this.faces[0].style.transform = `translateZ(${h}px)`

        this.faces[1].style.height = h + 'px'
        this.faces[1].style.transform = `translateY(${l - h / 2}px) translateZ(${h / 2}px) rotateX(-90deg)`
        this.faces[2].style.width = h + 'px'
        this.faces[2].style.transform = `translateX(${-h / 2}px) translateZ(${h / 2}px) rotateY(-90deg)`
        this.faces[3].style.height = h + 'px'
        this.faces[3].style.transform = `translateY(${-h / 2}px) translateZ(${h / 2}px) rotateX(90deg)`
        this.faces[4].style.width = h + 'px'
        this.faces[4].style.transform = `translateX(${w - h / 2}px) translateZ(${h / 2}px) rotateY(90deg)`
    }
    _set_fill(v) {
        if (v == 0) v = null
        if (!v) {
            this._fill = 0;
            this.filler.style.display = 'none'
            return
        }
        this._fill = v * 1;
        this.filler.style.display = 'block'
        this.filler.style.width = this._size[0] * this._fill + 'px'
        this.filler.style.height = this._size[1] * this._fill + 'px'
        if (this._fill == 1) this.filler.style.backgroundColor = 'hsla(0,100%,50%,.9)'
    }
    _set_selectable(v) {
        this._selectable = v
        if (v == null) this.faces[0].removeAttribute('selectable')
        else this.faces[0].setAttribute('selectable', '')
    }
    _set_name(v) {
        this.name.innerHTML = v
    }
    _set_val(v) {
        this.val.innerHTML = v
    }
    _set_background(v) {
        this.filler.style.backgroundColor = v
    }
}

try { customElements.define('x-block', XBlock) } catch { }