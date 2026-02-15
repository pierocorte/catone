/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_label.mjs
 *  Description: Component to realize a label
 */

import { PiCoComponent } from '../cmps/pc_component.mjs'
import '../cmps/pc_field.mjs'
import '../cmps/pc_button.mjs'
import i18next from '../utils/i18n.mjs'

export class PiCoLogin extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                display: flex;
                height: 100%;
                width: 100%;
                align-items: center;
                justify-content: center;
                background-color: hsl(0, 0%, 100%);
                font-size: .9em;
            }
            form {
                display: flex;
                box-sizing: border-box;
                border-radius: 1em;
                box-shadow: 0 0 5px rgba(0,0,0,.25);
                padding: 2em;
                min-width: 27em;
                background-color: hsl(0, 0%, 100%);
            }
            main {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1em;
                outline: none!important;
                background-color: hsl(0, 0%, 100%);
                flex: 1;
            }
            header {
                display: block;
                width: 100%;
            }
            pc-field {
                width: 100%;
                gap: .2em;
            }
            pc-field::part(label) {
                font-variant: none;
                font-size: 1em;
                color: hsl(220, 7%, 62%);
            }
            pc-field::part(input) {
                font-size: 1em;
                background-color: hsl(228, 38%, 97%);
                border: 1px solid hsl(228, 38%, 92%);
                border-radius: .5em;
                padding: 1em;
                color: hsl(220, 7%, 12%);
            }
            pc-field::part(input)::placeholder {
                font-style: italic;
                color: hsl(220, 7%, 62%);
            }   

            pc-button {
                width: 100%;
                padding: 1em;
                background-color: hsla(215, 92%, 61%, 1.00);
                border-radius: .5em;
            }
            response {
                display: block;
                width: 100%;
                height: 1.5em;
                line-height: 1.5em;
                color: hsl(0, 50%, 50%);
            }
        `
    }
    htm() {
        return `
            <form part="form">
                <main>
                    <header><slot name="header"></slot></header>
                    <pc-field value="test" label="Username" placeholder="user"></pc-field>
                    <pc-field value="eihep0Kaj5vuupea" label="Password" placeholder="password" type="password"></pc-field>
                    <response></response>
                    <pc-button text="Login"></pc-button>
                </main>
            </form>
        `
    }

    onCreation() {
        this.root = this.shadowRoot
        this.fields = this.root.querySelectorAll('pc-field')
        this.button = this.root.querySelector('pc-button')
        this.response = this.root.querySelector('response')
        this.button.addEventListener('click', this.login.bind(this))

        this.fields[0].setAttribute('placeholder', i18next.t('usernamePlaceholder'))
        this.fields[1].setAttribute('placeholder', i18next.t('passwordPlaceholder'))

        this.button.setAttribute('text', i18next.t('loginButton'))

        this.addEventListener('focus', e => this.response.innerHTML = '')

        if (!(this.children[0] && this.children[0].getAttribute('slot') == 'header')) {
            const defaultHeader = document.createElement('login-header')
            defaultHeader.setAttribute('slot', 'header')
            defaultHeader.innerHTML = 'LOGIN'
            defaultHeader.style.display = 'grid'
            defaultHeader.style.placeContent = 'center'
            defaultHeader.style.color = 'hsl(220, 64%, 38%)'
            defaultHeader.style.fontSize = '1.5em'
            defaultHeader.style.fontWeight = '600'
            this.appendChild(defaultHeader)
        }
    }

    login() {
        let email = this.fields[0].value
        let password = this.fields[1].value
        const ne = new Event('login')
        ne.email = email
        ne.password = password
        this.dispatchEvent(ne)
    }

    setResponse(msg) {
        this.response.innerHTML = msg
    }

}

try { customElements.define('pc-login', PiCoLogin) } catch { }