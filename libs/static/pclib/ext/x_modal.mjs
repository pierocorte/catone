import { PiCoContainer } from "../cmps/pc_container.mjs";
import { PiCoComponent } from "../cmps/pc_component.mjs";
import "../cmps/pc_icon.mjs";
import "../cmps/pc_input.mjs";
import "../cmps/pc_button.mjs";

export class XModal extends PiCoContainer {
    css() {
        return super.css() + `
            :host {
                position: fixed;
                display: block;
                left: 0%;
                top: 0%;
                width: 100%;
                height: 100%;
                padding: 10% 10% 10% 40%;
                transform: scale(0);
                transition: transform .5s;
                z-index: 1000;
            }

            main {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                background-color: hsla(0, 0%, 0%, .8);
                border-radius: 1em;
                color: white;
                padding: 1em;
            }
            header {
                display: flex;
                align-items: center;
                font-size: 1.5em;
            }
            header > label {
                flex: 1;
                font-weight: 600;
            }
            header > pc-icon {
                cursor: pointer;
            }

            content {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1em;
                height: 100%;
                overflow: hidden;
            }
            action pc-button {
                gap: .5em;
                background-color: hsla(0, 0%, 92%, .5);
                border: 1px solid hsla(0, 0%, 50%, .5);
                color: white;
                font-size: .9em;
                padding: .2em 1em;
                display: none;
            }
            form {
                display: block;
                width: 60%;
                height: 100%;
                overflow: hidden;
            }
            pc-field, pc-field-date {
                flex-direction: row;
                align-items: center;
                width: 100%;
            }
            pc-field::part(label), pc-field-date::part(label) {
                color: white;
                font-size: 1.1em;
                width:40%;
            }
            pc-field::part(input) {
                border: 1px solid gray;
                color: white;
                width: 60%;
                padding: .2em .3em;
                border-radius: .25em;
            }
            titolo {
                font-size: 1.2em;
                font-weight: 600;
            }
            message {
                font-size: .9em;
                color: hsla(0, 0%, 100%,.7);
                width: 80%;
                text-align: center;
            }
            action {
                display: flex;
                gap: 1em;
            }
            error {
                font-size: .9em;
                color: hsla(0, 90%, 70%,.9);
                width: 50%;
            }

        `
    }
    htm() {
        return `
            <main part="main">
                <header><label>Header</label><pc-icon name="cancel"></pc-icon></header>
                <content>
                    <titolo>Title</titolo>
                    <message part="message">Message</message>
                    <form part="form">
                        <slot name="form"></slot>
                    </form>
                    <error part="error"></error>
                    <action>
                        <pc-button id="confirm" text="confirm"></pc-button>
                        <pc-button id="abort" text="abort"></pc-button>
                        <pc-button id="cancel" text="cancel"></pc-button>
                    </action>
                </content>
            </main>
        `
    }

    onCreation() {
        super.onCreation()
        const root = this.shadowRoot
        this.$close = root.querySelector('pc-icon')
        this.$label = root.querySelector('header > label')
        this.$content = root.querySelector('content')
        this.$titolo = root.querySelector('titolo')
        this.$message = root.querySelector('message')
        this.$form = root.querySelector('form')
        this.$error = root.querySelector('error')
        this.$cancel = root.querySelector('pc-button#cancel')
        this.$abort = root.querySelector('pc-button#abort')
        this.$confirm = root.querySelector('pc-button#confirm')

        this.$close.addEventListener('click', this.hide.bind(this))
        this.$cancel.addEventListener('action', this.hide.bind(this))
        this.$abort.addEventListener('action', this.abort.bind(this))
        this.$confirm.addEventListener('action', this.confirm.bind(this))

        this.addEventListener('focus', e => this.setError(''))
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'header', 'title', 'close', 'cancel', 'abort', 'confirm']
    }
    _set_header(v) {
        this.$label.innerHTML = v
    }
    _set_title(v) {
        this.$titolo.innerHTML = v
    }
    _set_close(v) {
        this.$close.style.display = v == null || v == 'no' ? 'none' : 'inline-block'
    }
    _set_cancel(v) {
        if (v == null) this.$cancel.style.display = 'none'
        else {
            this.$cancel.style.display = 'inline-flex'
            this.$cancel.setAttribute('text', v)
        }
    }
    _set_abort(v) {
        if (v == null) this.$abort.style.display = 'none'
        else {
            this.$abort.style.display = 'inline-flex'
            this.$abort.setAttribute('text', v)
        }
    }
    _set_confirm(v) {
        if (v == null) this.$confirm.style.display = 'none'
        else {
            this.$confirm.style.display = 'inline-flex'
            this.$confirm.setAttribute('text', v)
        }
    }

    setContent(c) {
        this.$content.innerHTML = ''
        if (c) this.$content.appendChild(c)
    }
    setTitle(c) {
        this.$titolo.innerHTML = c
    }
    setMessage(c) {
        this.$message.innerHTML = c
    }
    setForm(c) {
        this.$form.innerHTML = ''
        if (c) this.$form.appendChild(c)
    }
    getForm() {
        return this.$form
    }
    setError(c) {
        this.$error.innerHTML = c
    }

    show() {
        this.style.transform = 'scale(1)'
    }
    hide() {
        this.onHide(false)
        this.style.transform = 'scale(0)'
    }
    abort() {
        let res = this.onResult(false)
        if (res) this.hide()
    }
    confirm() {
        let res = this.onResult(true)
        if (res) this.hide()
    }
    onResult(b) {
        console.log('MODAL RESULT', b)
        return b;
    }
    onHide() {
        console.log('MODAL HIDE')
    }
}


try { customElements.define('x-modal', XModal) } catch { }
