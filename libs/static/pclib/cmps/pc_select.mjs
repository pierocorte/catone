/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

// import { PICO } from './glob.mjs'
import { PiCoComponent } from './pc_component.mjs'
import { PiCoValuable } from './pc_valuable.mjs'
import './pc_input.mjs'

export class PiCoSelect extends PiCoValuable {
    css() {
        return super.css() + `
            :host {
                display: inline-flex;
                position: relative;
                align-items: center;

                border: .5px solid var(--bdc); 
                border-radius: .25em;
            }
            pc-input {
                flex: 1;
                border: none;
                outline: none;
            }
            pc-icon {
                border: .5px solid var(--bdc); 
                width: .9em;
                height: .9em;
                border-radius: 50%;
                margin: 0 .25em;
            }

            content {
                box-sizing: border-box;
                border: 1px solid black;
                height: 1.5em;
                width: 100%;
                padding: 0 .3em;
            }
            popup {
                box-sizing: border-box;
                position: absolute;
                display: none;
                flex-direction: column;
                --font-size: .9em;
                cursor: pointer;
                outline: none;
                z-index: 1000;
                width: 100%;
                background-color: white;
                border: .5px solid var(--bdc);
                border-radius: .25em;
                line-height: 1.5em;
                max-height: 8.74em;
                overflow: auto;
                gap: .5px;
                top: 100%;
                margin-top: 1px;
            }
            popup > item {
                display: block;
                padding: .1em .3em;
                background-color: hsla(210, 60%, 40%, .1);
            }
            popup > item:nth-child(even) {
                background-color: hsla(210, 60%, 40%, .2);
            }
            popup > item:hover {
                background-color: var(--btn-hlc);
                color: var(--btn-fgc);
            }
        `
    }
    htm() {
        return `
            <pc-input pca-fire-always></pc-input><pc-icon>arrow_drop_down</pc-icon>
            <popup part="popup">
                <item>Option 1</item>
                <item>Option 2</item>
                <item>Option 3</item>
            </popup>
        `
    }

    onCreation() {
        const root = this.shadowRoot
        this.input = root.querySelector('pc-input')
        this.ddbutton = root.querySelector('pc-icon')
        this.popup = root.querySelector('popup')
        this.input._fire = false

        this.input.addEventListener('pointerdown', e => {
            this.popup.style.display = 'flex'
        })
        this.ddbutton.addEventListener('pointerdown', e => {
            this.__pointerDown = true
            this.popup.style.display = 'flex'
            if (document.activeElement != this) this.input.focus()
        })
        this.popup.addEventListener('pointerdown', e => {
            this.__pointerDown = true
        })

        this.popup.addEventListener('pointerup', e => {
            e.stopImmediatePropagation()
            if (e.target.tagName == 'ITEM') this.input.value = e.target.innerHTML
            this._select(this.input.value)
            this.blur()
        })
        this.addEventListener('blur', e => {
            if (this.__pointerDown) { this.__pointerDown = false; this.input.focus(); return }
            this.__focus = false
            this.popup.style.display = 'none'
            let v = this.input.value
            if (this._options && this._options.indexOf(v) != -1) {
                this._filter('');
                this._firePceBlur()
                return
            }
            this.input.value = this.input.oldValue
            if (this.popup.children[0]) this.input.value = this.popup.children[0].innerHTML
            this._select(this.input.value)
            this._firePceBlur()

        })
        this.addEventListener('focus', e => {
            if (this.__focus) { return }
            this.__focus = true
            this.value = this.input.value
            this._firePceFocus()
        })
        this.addEventListener('keydown', e => {
            if (e.key == 'Tab') {
                this.popup.style.display = 'none'
                this.input.blur()
            } else if (e.key == ' ') {
                this.popup.style.display = 'flex'
            }
        })
        this.addEventListener('keyup', e => {
            this._filter(this.input.getCurrentValue())
        })

    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'value', 'options', 'rows', 'placeholder', 'readonly']
    }
    _set_value(v) {
        console.log('Setting value:', v)
        v = v == undefined ? '' : v
        this.input.value = v
        super.value = v
        if (this.model) this.model.value = v
    }
    _set_options(v) {
        this._options = v.split(',')
        this._options = this._options.map(o => o.trim())
        this.popup.innerHTML = ''
        this._options.forEach(element => {
            const item = document.createElement('item')
            item.innerHTML = element
            this.popup.appendChild(item)
        })
    }
    _set_rows(v) {
        this._rows = v * (1.5 + .25)
        this.popup.style.maxHeight = this._rows + 'em'
    }
    _set_placeholder(v) {
        this.input.setAttribute('placeholder', v)
    }
    _set_readonly(v) {
        this.input.setAttribute('readonly', v)
    }

    getValue() { return super.getValue() }
    setValue(v) {
        v = v == undefined ? '' : v
        this.input.value = v
        super.setValue(v)
    }

    _select(v) {
        if (!this._options || this._options.indexOf(v) == -1) v = ''
        this.setAttribute('value', v)
        this.popup.style.display = 'none'
        this._filter('')
    }

    _filter(f) {
        f = f.trim().toLowerCase()
        let options = this._options
        if (f != '') options = this._options.filter(o => o.toLowerCase().indexOf(f) != -1)
        this.popup.innerHTML = ''
        if (!options) return
        options.forEach(element => {
            const item = document.createElement('item')
            item.innerHTML = element
            this.popup.appendChild(item)
        })
    }

    get model() { return super.model }
    set model(m) {
        super.model = m
        this.value = m.value
    }

    notified(source, event) {
        this.setValue(event.value)
    }

}

try { customElements.define('pc-select', PiCoSelect) } catch { }