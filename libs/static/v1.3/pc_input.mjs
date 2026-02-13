/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

// import { PICO } from './glob.mjs'
import { PiCoComponent } from './pc_component.mjs'
import { PiCoValuable } from './pc_valuable.mjs'

export class PiCoInput extends PiCoValuable {
    css() {
        return super.css() + `
            :host {
                --placeholder-color: hsl(0 0 50/.75);
                --placeholder-font-style: italic;
                
                display: inline-flex;
                align-items: center;


                border: .05em solid hsl(0 0 50/.75);
                border-radius: .25em;
                padding: 0 .3em;

                min-width: 4em;

                overflow: hidden;

            }
            content {
                flex: 1 1 0;
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
            error {
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
            <content contenteditable></content>
            <error part="error" tabindex="0"><error-popup></error-popup>!</error>
        `
    }

    onCreation() {
        this.content = this.shadowRoot.querySelector('content')
        this.error = this.shadowRoot.querySelector('error')
        this.popup = this.error.querySelector('error-popup')

        this.password = ''
        this.content.addEventListener('blur', e => {
            this.setValue(this.content.innerHTML)
            setTimeout(() => {
                this.blur();
            }, 0);
        })
        this.content.addEventListener('keydown', e => {
            this.shadowRoot.querySelector('error').style.display = 'none'
            if (e.key == 'Enter') {
                e.preventDefault()
                this.content.blur()
            }
        })
        // this.content.addEventListener('keyup', e=>{
        //     let t = this.content
        //     if (t.innerHTML === '<br>' || t.textContent.trim() === '') t.innerHTML = '';
        // })

        this.error.addEventListener('click', e => {
            e.stopPropagation()
            if (this.pcaDesign) return
            this.popup.innerHTML = this._error
            document.documentElement.appendChild(this.popup)
            let bb = this.error.getBoundingClientRect()
            this.popup.style.left = bb.x + 'px'
            this.popup.style.top = (bb.y - bb.height / 2) + 'px'
            this.popup.style.position = 'absolute'
            this.popup.style.display = 'block'
            window.addEventListener('pointerdown', closeErrorPopup)
        })
        this.error.addEventListener('blur', closeErrorPopup)

        function closeErrorPopup(e) {
            window.removeEventListener('pointerdown', closeErrorPopup)
            closeErrorPopup.popup.style.display = 'none'
        }
        closeErrorPopup.popup = this.popup

        this._type = 'string'
        this.value = this.innerHTML
        this.content.innerHTML = this.innerHTML
        this.innerHTML = this.innerText = ''
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'value', 'placeholder', 'type', 'fire-on-blur']
    }
    onAttributeChanged(name, oldValue, newValue) {
        switch (name) {
            case 'value': {
                console.log('set', newValue)
                this.setValue(newValue)
                // this.value = newValue
                // this.content.innerHTML = this.value
                break
            }
            case 'placeholder': {
                this.content.setAttribute('placeholder', newValue)
                break
            }
            case 'type': {
                let nve = newValue.split(':')
                this._type = nve[0]
                this._length = nve[1]
                //if (!this._length) this._length = Number.POSITIVE_INFINITY
                this.setValue(this.value)
                if (this._type == 'password') {
                    this.content.addEventListener('input', e => {
                        if (this._type != 'password') return
                        let div = this.content
                        if (div.innerHTML === '<br>' || div.textContent.trim() === '') div.innerHTML = '';
                        const newText = div.innerText;
                        console.log('pretest', newText, this.password)
                        if (newText.length < this.password.length) {
                            // Deletion
                            console.log('deletion', newText, this.password)
                            this.password = this.password.slice(0, this.password.length - 1);
                        } else {
                            // Addition
                            const addedChar = newText.slice(newText.length - 1)
                            this.password += addedChar;
                        }
                        console.log('PASSWD', this.password)
                        // Replace visible text with asterisks
                        console.log(this.password, this.password.length)
                        div.innerText = '●'.repeat(this.password.length);
                        // Move cursor to end
                        const range = document.createRange();
                        const sel = window.getSelection();
                        range.selectNodeContents(div);
                        range.collapse(false);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    })
                    this.content.addEventListener('focus', e => {
                        if (this._type != 'password') return
                        this.password = ''
                        this.content.innerText = ''
                    })
                }
                break
            }
            default: {
                super.onAttributeChanged(name, oldValue, newValue)
                break
            }
        }
    }

    get passive() { return this.content.getAttribute('contenteditable') }
    set passive(v) {
        if (v == null) this.content.setAttribute('contenteditable', '')
        else this.content.removeAttribute('contenteditable')
    }

    get value() { return super.value }
    set value(v) {
        v = v == undefined ? '' : v
        this.content.innerHTML = v
        super.value = v
        if (this.model) this.model.value = v
    }
    getValue() { return super.getValue() }
    setValue(v) {
        v = v == undefined ? '' : v
        this.content.innerHTML = v
        super.setValue(v)
        if (v != '' && !this.validate(v)) {
            let ne = new Event('error', { bubbles: true })
            ne.value = v
            ne.error = this._error
            this.dispatchEvent(ne)
            this.shadowRoot.querySelector('error').style.display = 'grid'
        }
    }

    get model() { return super.model }
    set model(m) {
        super.model = m
        this.value = m.value
    }

    notified(source, event) {
        this.setValue(event.value)
    }

    validate(v) {
        // console.log(this._type, this._length)
        switch (this._type) {
            case 'password': {
                v = this.password
                if (v.length < 8) return false
                if (!v.match(/[a-z]/)) return false
                if (!v.match(/[A-Z]/)) return false
                if (!v.match(/[0-9]/)) return false
                if (!v.match(/[^a-zA-Z0-9]/)) return false
                if (v.match(/[\s]/)) return false
                break
            }
            case 'string': {
                if (this._length && v.length > this._length) {
                    this._error = 'Length exceeded'
                    return false
                }
                break
            }
            case 'number': {
                if (!v.match(/^[+-]?\d+(\.\d+)?$/)) return false
                break
            }
            case 'integer': {
                if (!v.match(/^[+-]?\d+$/)) {
                    this._error = 'Not an integer'
                    return false
                }
                break
            }
            case 'natural': {
                if (!v.match(/^[+]?\d+$/)) {
                    this._error = 'Not a natural number'
                    return false
                }
                break
            }
            case 'boolean': {
                if (v != 'true' && v != 'false') return false
                break
            }
            case 'date': {
                if (!v.match(/^\d{2}\/\d{2}\/\d{4}$/)) return false
                break
            }
            case 'time': {
                if (!v.match(/^\d{2}:\d{2}:\d{2}$/)) return false
                break
            }
            case 'datetime': {
                if (!v.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) return false
                break
            }
            case 'url': {
                if (!v.match(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/)) return false
                break
            }
            case 'phone': {
                if (!v.match(/^\+?[0-9]{1,4}?[-. ]?\(?[0-9]{1,4}?\)?[-. ]?[0-9]{1,4}[-. ]?[0-9]{1,9}$/)) {
                    this.error = 'Invalid phone format'
                    return false
                }
                break
            }
            case 'zip': {
                if (!v.match(/^\d{5}(-\d{4})?$/)) return false
                break
            }
            case 'ssn': {
                if (!v.match(/^\d{3}-\d{2}-\d{4}$/)) return false
                break
            }
            case 'ip': {
                if (!v.match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) return false
                break
            }
            case 'creditcard': {
                if (!v.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|7[0-9]{15}|(2131|1800|35\d{3})\d{11})$/)) return false
                break
            }
            case 'uuid': {
                if (!v.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) return false
                break
            }
            case 'mac': {
                if (!v.match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)) return false
                break
            }
            case 'ipv4': {
                if (!v.match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) return false
                break
            }
            case 'ipv6': {
                if (!v.match(/([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|::([0-9a-fA-F]{1,4}:){0,6}([0-9a-fA-F]{1,4}|:)|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){3}|([0-9a-zA-Z]){32})|([0-9a-zA-Z]){32}/)) return false
                break
            }
            case 'color': {
                if (!v.match(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)) return false
                break
            }
            case 'hex': {
                if (!v.match(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)) return false
                break
            }
            case 'rgb': {
                if (!v.match(/^rgb\(\s*(\d{1,3}\s*,\s*){2}\d{1,3}\s*\)$/)) return false
                break
            }
            case 'rgba': {
                if (!v.match(/^rgba\(\s*(\d{1,3}\s*,\s*){3}(\d(\.\d+)?)?\s*\)$/)) return false
                break
            }
            case 'hsl': {
                if (!v.match(/^hsl\(\s*(\d{1,3}\s*,\s*){2}(\d(\.\d+)?)?\s*\)$/)) return false
                break
            }
            case 'hsla': {
                if (!v.match(/^hsla\(\s*(\d{1,3}\s*,\s*){2}(\d(\.\d+)?)?\s*\)$/)) return false
                break
            }
            case 'base64': {
                if (!v.match(/^[A-Za-z0-9+/]+={0,2}$/)) return false
                break
            }
            case 'binary': {
                if (!v.match(/^[01]+$/)) return false
                break
            }
            case 'octal': {
                if (!v.match(/^[0-7]+$/)) return false
                break
            }
            case 'hexadecimal': {
                if (!v.match(/^[0-9A-Fa-f]+$/)) return false
                break
            }
            case 'ascii': {
                if (!v.match(/^[\x00-\x7F]+$/)) return false
                break
            }
            case 'unicode': {
                if (!v.match(/^[\u0000-\uFFFF]+$/)) return false
                break
            }
            case 'alphanumeric': {
                if (!v.match(/^[a-zA-Z0-9]+$/)) return false
                break
            }
            case 'alphabetic': {
                if (!v.match(/^[a-zA-Z]+$/)) return false
                break
            }
            case 'numeric': {
                if (!v.match(/^[0-9]+$/)) return false
                break
            }
            case 'symbol': {
                if (!v.match(/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/)) return false
                break
            }
            case 'emoji': {
                if (!v.match(/^[\uD83C-\uDBFF\uDC00-\uDFFF]+$/)) return false
                break
            }
            case 'html': {
                if (!v.match(/<\/?[a-z][\s\S]*>/i)) return false
                break
            }
            case 'xml': {
                if (!v.match(/<\?xml.*\?>/)) return false
                break
            }
            case 'json': {
                try {
                    JSON.parse(v)
                } catch (e) {
                    return false
                }
                break
            }
            case 'csv': {
                if (!v.match(/^[^,\n]+(,[^,\n]+)*$/)) return false
                break
            }
            case 'yaml': {
                if (!v.match(/^\s*([a-zA-Z0-9_]+):\s*([a-zA-Z0-9_]+|".*"|'.*'|true|false|null)\s*$/)) return false
                break
            }
            case 'markdown': {
                if (!v.match(/^(#{1,6} .+|[-*] .+|> .+|`.+`|!\[.*\]\(.*\)|\[.*\]\(.*\)|\*\*.*\*\*|\*.*\*|~~.*~~)$/)) return false
                break
            }
            case 'latex': {
                if (!v.match(/^\$.*\$/)) return false
                break
            }
            case 'sql': {
                if (!v.match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|JOIN|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT)\s+/i)) return false
                break
            }
            case 'regex': {
                try {
                    new RegExp(v)
                } catch (e) {
                    return false
                }
                break
            }
            case 'html5': {
                if (!v.match(/^(<\s*html.*>)(<\s*head.*>)(<\s*body.*>)(<\/\s*body\s*>)(<\/\s*html\s*>)/i)) return false
                break
            }
            case 'xml5': {
                if (!v.match(/^(<\s*xml.*>)(<\s*head.*>)(<\s*body.*>)(<\/\s*body\s*>)(<\/\s*xml\s*>)/i)) return false
                break
            }
            case 'javascript': {
                if (!v.match(/^(var|let|const|function|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|super)\s+/i)) return false
                break
            }
            case 'typescript': {
                if (!v.match(/^(var|let|const|function|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|super)\s+/i)) return false
                break
            }
            case 'python': {
                if (!v.match(/^(def|class|if|else|elif|for|while|try|except|finally|with|as|import|from|return|break|continue)\s+/i)) return false
                break
            }
            case 'email': {
                if (!v.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) return false
                break
            }
        }
        return true
    }
}

try { customElements.define('pc-input', PiCoInput) } catch { }