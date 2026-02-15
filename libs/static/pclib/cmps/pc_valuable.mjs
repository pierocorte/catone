import { PiCoComponent } from './pc_component.mjs'

export class PiCoValuable extends PiCoComponent {
    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'value', 'pca-fire-always']
    }
    _set_value(v) {
        this.value = v || ''
    }
    fireAlways() {
        return this.getAttribute('pca-fire-always') != null
    }
    isValueChanged() {
        return this.oldValue != this.value
    }

    get value() {
        return this._value == undefined ? '' : this._value
    }
    set value(v) {
        if (v == this.value) return
        this._oldValue = this.value
        this._value = v
        return this._value
    }

    get oldValue() {
        return this._oldValue == undefined ? '' : this._oldValue
    }

    getValue() { return this.value }
    setValue(v) {
        this.value = v
        this._firePceBlur()
    }

    _firePceBlur() {
        if (this == document.activeElement && !this.isValueChanged()) return
        if (this.isValueChanged() || this.fireAlways()) {
            let e = new Event('pce-blur')
            e.value = this.value
            e.oldValue = this.oldValue
            e.reason = this.isValueChanged() ? 'change' : 'blur'
            this.dispatchEvent(e)
        }
    }
    _firePceFocus() {
        this._oldValue = this.value
        const ne = new Event('pce-focus')
        ne.value = this.value
        ne.oldValue = this.oldValue
        ne.reason = 'focus'
        this.dispatchEvent(ne)
    }

}

try { customElements.define('pc-valuable', PiCoValuable) } catch { }
