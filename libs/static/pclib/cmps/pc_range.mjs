import { DAD } from '../utils/dad.mjs'
import { PiCoValuable } from './pc_valuable.mjs'

export class PiCoRange extends PiCoValuable {
    css() {
        return super.css() + `
            :host {
                display: inline-flex;
                position: relative;
                align-items: center;

                width: 15em;
                height: calc(1.5em + 1px);
                border-color: var(--bdc);
                border-radius: .25em;
                padding: .5em 1.25em;
            }
            line {
                display: flex;
                box-sizing: border-box;
                background-color: var(--text-bg-2);
                border: .5px inset var(--bdc);
                overflow: hidden;
                border-radius: .2em; /* to micro-align vertically when chage the knob font-size */
                width: 100%;
                height: 100%;
            }
            level {
                display: block;
                background-color: var(--btn-bgc);
                height: 100%;
                width: 50%;
            }
            knob {
                box-sizing: border-box;
                font-size: .9em;
                position: absolute;
                border: .5px outset var(--bdc);
                background-color: hsla(210, 50%, 30%, .8 );
                color: var(--btn-fgc);
                border-radius: .25em;
                padding: 0 .2em;
                cursor: grab;
                height: 1.5em;
                line-height: 1.4em;
                width: 2.5em;
                overflow: hidden;
                text-align: center;
            }
        `
    }
    htm() {
        return `
            <line>
                <level></level>
            </line>
            <knob part="knob" pca-draggable>0</knob>
        `
    }

    onCreation() {
        const root = this.shadowRoot
        this.line = root.querySelector('line')
        this.level = root.querySelector('level')
        this.knob = root.querySelector('knob')
        this.setAttribute('tabindex', 0)

        this.value = 0
        this.initialValue = 0
        this.min = -10
        this.max = 10
        this.step = 1
        this.stepMovement = true
        this.orientation = 'horizontal'

        this.line.addEventListener('click', e => {
            this._move({ x: e.clientX, y: e.clientY })
        })

        // this._setOrientation(this.orientation)

        this.down = function (e) {
            let p = { x: e.clientX, y: e.clientY }
            this.RBB = this.getBoundingClientRect()
            this.knob.style.cursor = 'grabbing'
            document.body.style.cursor = 'grabbing'
            this._pp = { x: p.x, y: p.y }
            this._move(this._pp)
            this.knob.setPointerCapture(e.pointerId);
            this.knob.addEventListener('pointermove', this.move)
            this.knob.addEventListener('pointerup', this.up)
        }
        this.up = e => {
            this.knob.style.cursor = 'grab'
            document.body.style.cursor = 'default'
            this.knob.removeEventListener('pointermove', this.move)
            this.knob.removeEventListener('pointerup', this.up)
        }
        this.move = (e) => {
            let p = { x: e.clientX, y: e.clientY }
            this._move(p)
        }
        this.knob.addEventListener('pointerdown', this.down.bind(this))

        this.RBB = this.line.getBoundingClientRect()
        this.KBB = this.knob.getBoundingClientRect()
        this.setValue(this.value)

        this.addEventListener('focus', e => this._firePceFocus())
        this.addEventListener('blur', e => this._firePceBlur())
    }

    _move(p) {
        let isv = this.orientation == 'vertical'
        let dim = isv ? 'height' : 'width'
        let coord = isv ? 'y' : 'x'
        let prop = isv ? 'top' : 'left'
        let max = this.RBB[dim] - this.KBB[dim]
        let pt = p[coord] - this.RBB[coord] - this.KBB[dim] / 2
        pt = pt < 1 ? 1 : pt > max - 1 ? max - 1 : pt
        this.knob.style[prop] = pt + 'px'
        pt = isv ? max - pt : pt
        let v = pt / max * (this.max - this.min) + this.min
        this.setValue(v)
    }

    static get observedAttributes() {
        return ['k-label', 'value', 'min', 'max', 'step', 'decimals', 'orientation', 'width', 'height', 'knob-width', 'knob-height', 'font-size', 'step-movement', 'hue'];
    }
    _set_value(v) {
        v = parseFloat(v)
        this.initialValue = v
        this.setValue(v)
    }
    _set_hue(v) {
        this.knob.style.backgroundColor = `hsla(${v}, 50%, 30%, .8 )`
        this.level.style.backgroundColor = `hsl(${v}, 100%, 50%)`
    }
    // attributeChangedCallback(name, oldValue, newValue) {
    //     super.attributeChangedCallback(name, oldValue, newValue)
    //     switch (name) {
    //         case 'k-label': {
    //             this.kLabel = newValue
    //             this.knob.innerHTML = newValue
    //             break
    //         }
    //         case 'value': {
    //             let v = parseFloat(newValue)
    //             this.initialValue = v
    //             this.setValue(v)
    //             break
    //         }
    //         case 'min': {
    //             this.min = parseFloat(newValue)
    //             this.setValue(this.initialValue)
    //             break
    //         }
    //         case 'max': {
    //             this.max = parseFloat(newValue)
    //             this.setValue(this.initialValue)
    //             break
    //         }
    //         case 'step': {
    //             this.step = parseFloat(newValue)
    //             this.setValue(this.initialValue)
    //             break
    //         }
    //         case 'decimals': {
    //             this.decimals = parseInt(newValue)
    //             this.setValue(this.initialValue)
    //             break;
    //         }
    //         case 'orientation': {
    //             this.orientation = newValue
    //             this._setOrientation(newValue)
    //             this.setValue(this.value)
    //             break
    //         }
    //         case 'width': {
    //             this.width = newValue
    //             this.style.width = newValue
    //             break
    //         }
    //         case 'height': {
    //             this.height = newValue
    //             this.style.height = newValue
    //             break
    //         }
    //         case 'knob-width': {
    //             this.knob.style.width = newValue
    //             this._setOrientation(this.orientation)
    //             break
    //         }
    //         case 'knob-height': {
    //             this.knob.style.lineHeight = newValue
    //             break
    //         }
    //         case 'font-size': {
    //             this.knob.style.fontSize = newValue
    //             this.connectedCallback()
    //             break
    //         }
    //         case 'step-movement': {
    //             this.stepMovement = newValue != 'false'
    //             break
    //         }
    //     }
    // }

    _set_orientation(v) {
        this.orientation = v
        this.className = v
        this.TBB = this.getBoundingClientRect()
        this.KBB = this.knob.getBoundingClientRect()
        switch (this.orientation) {
            case 'vertical':
                this.style.padding = '.7em .9em'
                this.style.height = '15em'
                this.style.width = 'calc(2.5em - 1px)'
                this.level.style.placeSelf = 'end'
                this.knob.style.left = '1px'
                break
            default: // case 'horizontal':
                this.style.padding = '.5em 1.25em'
                this.style.width = '15em'
                this.style.height = 'calc(1.5em + 1px)'
                this.level.style.placeSelf = 'start'
                this.knob.style.top = 'auto'
                break
        }
        this.setValue(this.value)
    }

    setValue(v) {
        v = this._stepValue(v)
        if (!this.RBB) return;
        this.RBB = this.getBoundingClientRect()
        let isv = this.orientation == 'vertical'
        let dim = (isv ? 'height' : 'width')
        let prop = isv ? 'top' : 'left'
        let max = this.RBB[dim] - this.KBB[dim] - 3
        let pt = (v - this.min) / (this.max - this.min) * max + (this.orientation == 'vertical' ? -1 : 1)
        this.level.style[dim] = pt <= 1 ? 0 : pt + 2 + 'px'
        if (this.stepMovement) {
            pt = isv ? max - pt : pt
            this.knob.style[prop] = pt + 'px'
        }
    }

    _stepValue(v) {
        v = v < this.min ? this.min : v > this.max ? this.max : v
        v = v + this.step / 2
        v = Math.floor((v - this.min) / this.step) * this.step + this.min
        if (v != this.value && this.cb_changed) this.cb_changed(v)
        this.value = v
        this.knob.innerHTML = this.kLabel || v.toFixed(this.decimals)
        return v
    }

}

try { customElements.define('pc-range', PiCoRange) } catch { }