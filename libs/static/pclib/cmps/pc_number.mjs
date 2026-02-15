import { PiCoComponent } from './pc_component.mjs'
import { PiCoValuable } from './pc_valuable.mjs'
import './pc_icon.mjs'

export class PiCoNumber extends PiCoValuable {
    css() {
        return super.css() + `
            :host {
                display: inline-flex;
                border-radius: .25em;
                padding: 0;
                min-width: 6em;
                width: 6em;
                border-color: var(--bdc);
                overflow: hidden;
            }
            :host(.disabled) {
                background-color: var(--btn-disc);
            }
            input {
                all: unset;
                padding: 0 .25em;
                flex: 1;
                width: 1em;
                text-align: right;
            }
            ops {
                user-select: none;
                display: grid;
                grid-template-rows: 1fr 1fr;
                border: 1px outset var(--button-border-color);
                overflow: hidden;
                cursor: pointer;
                place-content: center;
                width: 1em;
            }
            #up, #down {
                display: grid;
                background-color: var(--btn-bgc);
                color: var(--btn-fgc);
                line-height: 50%;
                overflow: hidden;
            }
            #up:active, #down:active {
                background-color: var(--btn-hlc);
            }
        `
    }
    htm() {
        return `
            <input part="input">
            <ops>
                <pc-icon id="up" name="arrow_drop_up" weight="500"></pc-icon>
                <pc-icon id="down" name="arrow_drop_down" weight="500"></pc-icon>
            </ops>
        `
    }

    onCreation() {
        let root = this.shadowRoot
        this.input = root.querySelector('input')
        this.ops = root.querySelector('ops')
        this._up = this.ops.querySelector('#up')
        this._down = this.ops.querySelector('#down')

        this._up.addEventListener('click', _ => {
            this.increase()
            this.blur()
        })
        this._down.addEventListener('click', _ => {
            this.decrease()
            this.blur()
        })
        this.input.addEventListener('keypress', e => this.enter(e))
        this.input.addEventListener('blur', _ => this.blur())
        this.input.addEventListener('focus', _ => this.focus())

        // this.val = 0
        this.step = 1
        this.unit = 'px'
        this.decimals = 0
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'value', 'step', 'decimals', 'unit']
    }
    _set_value(v) {
        v = 1 * v
        this.value = 1 * v.toFixed(this.decimals)
        this.input.value = this.value + ' ' + this.unit
    }
    _set_step(v) {
        this.step = +v
    }
    _set_decimals(v) {
        this.decimals = +v
        this.input.value = this.value.toFixed(this.decimals) + ' ' + this.unit
    }
    _set_unit(v) {
        this.unit = v
        this.input.value = this.value.toFixed(this.decimals) + ' ' + this.unit
    }

    increase() {
        let nv = this.value + this.step
        this.value = 1 * nv.toFixed(this.decimals)
        // this.input.value = this.val.toFixed(this.decimals) + ' ' + this.unit
    }
    decrease() {
        let nv = this.value - this.step
        this.value = 1 * nv.toFixed(this.decimals)
        // this.input.value = this.val.toFixed(this.decimals) + ' ' + this.unit
    }
    enter(e) {
        if (e.key === "Enter") {
            this.value = 1 * this.input.value
            this.input.blur()
        }
    }
    blur() {
        this.input.value = this.value + ' ' + this.unit
        this._firePceBlur()
    }
    focus() {
        this._firePceFocus()
    }
}

try { customElements.define('pc-number', PiCoNumber) } catch { }
