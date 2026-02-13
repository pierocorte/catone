import { PiCoComponent } from './pc_component.mjs'

export class PiCoValuable extends PiCoComponent {

    static get observedAttributes() { 
        return [...PiCoComponent.observedAttributes,'fire-on-blur']
    }

    get value() { return this._value }
    set value(v) { return this._value = v }

    getValue() { return this.value }
    setValue(v) {
        console.log('setValue', v, this.value, this._fireOnBlur)
        if (this.value == v && !this._fireOnBlur) return
        this.value = v
        this._reason = 'changeValue'
        this.#fireChange()
    }

    get fireOnBlur() { return this.hasAttribute('fire-on-blur') }
    set fireOnBlur(v) {
        console.log('set fireOnBlur', v)
        this._fireOnBlur = v!=null
    }

    // addValue(v) {
    //     if (!Array.isArray(this._value)) return
    //     this._value.push(v)
    //     this._addValue = v
    //     this._reason = 'addValue'
    //     this.#fireChange()
    // }
    // delValue(v) {
    //     if (!Array.isArray(this._value)) return
    //     let i = this._value.indexOf(v)
    //     if (i==-1) return
    //     this._value.splice(i,1)
    //     this._delValue = v
    //     this._reason = 'delValue'
    //     this.#fireChange()
    // }
    
    #fireChange() { 
        let e = new Event('change')
        e.value = this._value
        e.addValue = this._addValue
        e.delValue = this._delValue
        e.reason = this._reason
        this.dispatchEvent(e)
    }

    getEventNames() {
        return [...super.getEventNames(), 'change']
    }

}
