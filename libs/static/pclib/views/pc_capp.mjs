/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: PCApp.mjs
 *  Description: App Widget - The root widget of the application
 */


import { PiCoContainer } from '../cmps/pc_container.mjs';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

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
                padding: 1em;
            }
            splash {
                box-sizing: border-box;
                position: absolute;
                display: block;
                top:0;
                left:0;
                width: 100%;
                height: 100%;
                transition: opacity ease-in-out 2.5s;
            }
            main {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                transition: opacity ease-in-out 4s;
                box-shadow: var(--shadow);
                border-radius: .7em;
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
        `
    }
    htm() {
        return `
            <splash><slot name="splash"></slot></splash>
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
        this.header = root.querySelector('header')
        this.footer = root.querySelector('footer')
        this.leftbar = root.querySelector('leftbar')
        this.rightbar = root.querySelector('rightbar')
        this.content = root.querySelector('content')
        Array.from(this.children).forEach(c => {
            let slot = c.getAttribute('slot')
            if (slot == "splash") {
                this.content.style.opacity = 0;
                setTimeout(() => {
                    this.splash.style.opacity = 0
                    this.content.style.opacity = 1
                }, 1000)
            }
        })
        this._manageKeyboardOnNativePlatform()
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

    slideTo(y) {
        this.scrollTo({
            top: y,     // pixels from top (vertical scrolling)
            left: 0,    // pixels from left (horizontal scrolling)
            behavior: "smooth"
        });
    }

    _manageKeyboardOnNativePlatform() {
        if (Capacitor.isNativePlatform()) {
            Keyboard.addListener('keyboardDidShow', (info) => {
                const active = document.activeElement;
                const bbe = active.getBoundingClientRect()
                let ds = bbe.y - 25
                const topspace = screen.height - info.keyboardHeight
                if (bbe.y + 200 < topspace) return
                ds = ds > info.keyboardHeight ? info.keyboardHeight - 28 : ds
                this.content.style.top = -ds + 'px'
            });
            Keyboard.addListener('keyboardWillHide', () => {
                console.log('Keyboard will hide');
                this.content.style.top = '0px'
            });
        }
    }
}

try { customElements.define('pc-app', PiCoApp) } catch { }