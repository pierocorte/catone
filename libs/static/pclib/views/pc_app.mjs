/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: PCApp.mjs
 *  Description: App Widget - The root widget of the application
 */


import { PiCoComponent } from '../cmps/pc_component.mjs';
import { PiCoContainer } from '../cmps/pc_container.mjs';

export class PiCoApp extends PiCoContainer {
    css() {
        return super.css() + `
            :host {
                position: relative;
                box-sizing: border-box;
                display: block;
                width: 100%;
                height: 100%;
                border: 0px solid var(--bdc);
                background-color: var(--app-bgc);
                outline: none!important;
                padding: 0em;
            }
            splash, login {
                box-sizing: border-box;
                position: absolute;
                display: block;
                top:0;
                left:0;
                width: 100%;
                height: 100%;
                transition: opacity ease-in-out 2.5s;
            }
            login {
                display: none;
            }
            main {
                box-sizing: border-box;
                display: none;
                flex-direction: column;
                width: 100%;
                height: 100%;
                box-shadow: var(--shadow);
                --border-radius: .7em;
                overflow: hidden;
            }
            header, footer {
                display: none;
                width: 100%;
                overflow: hidden;
            }
            middle {
                box-sizing: border-box;
                display: flex;
                flex: 1;
                width: 100%;
                overflow: hidden;
            }
            leftbar, rightbar {
                display: none;
                overflow: hidden;
            }
            content {
                flex: 1;
                width: 100%;
                overflow: hidden;
            }
            rightbar {
                --width: 0;
                transition: width .3s;
            }
        `
    }
    htm() {
        return `
            <splash><slot name="splash"></slot></splash>
            <login><slot name="login"></slot></login>
            <main>
                <header><slot name="header"></slot></header>
                <middle>
                    <leftbar><slot name="leftbar"></slot></leftbar>
                    <content><slot name="content"></content>
                    <rightbar><slot name="rightbar"></slot></rightbar>
                </middle>
                <footer><slot name="footer"></slot></footer>
            </main>
        `
    }

    onCreation() {
        super.onCreation()
        const root = this.shadowRoot
        this.splash = root.querySelector('splash')
        this.login = root.querySelector('login')
        this.main = root.querySelector('main')
        this.header = root.querySelector('header')
        this.footer = root.querySelector('footer')
        this.leftbar = root.querySelector('leftbar')
        this.rightbar = root.querySelector('rightbar')
        this.content = root.querySelector('content')
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'header', 'footer', 'leftbar', 'rightbar']
    }
    _set_header(v) {
        this.header.style.display = v == 'on' ? 'block' : 'none'
    }
    _set_footer(v) {
        this.footer.style.display = v == 'on' ? 'block' : 'none'
    }
    _set_leftbar(v) {
        this.leftbar.style.display = v == 'on' ? 'block' : 'none'
    }
    _set_rightbar(v) {
        this.rightbar.style.display = v == 'on' ? 'block' : 'none'
    }

    changeOrientation(isPortrait) {
        this.navigator.changeOrientation(isPortrait)
    }

    start() {
        const splashTime = this.getAttribute('splash-time') || 3000
        let started = false
        Array.from(this.children).forEach(c => {
            let slot = c.getAttribute('slot')
            if (slot == "splash") {
                started = true
                setTimeout(() => {
                    this.splash.style.opacity = 0
                    setTimeout(() => this.dispatchEvent(new Event('started')), 1800)
                }, splashTime)
            }
        })
        if (!started) this.dispatchEvent(new Event('started'))
    }

    showMain() {
        this.login.style.display = 'none'
        this.main.style.display = 'flex'
        this.dispatchEvent(new Event('show-main'))
    }
    showLogin() {
        this.main.style.display = 'none'
        this.login.style.display = 'block'
    }
}

try { customElements.define('pc-app', PiCoApp) } catch { }