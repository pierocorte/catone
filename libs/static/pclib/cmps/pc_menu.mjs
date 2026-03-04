import { PiCoComponent } from "./pc_component.mjs";
import "./pc_icon.mjs";
import "./pc_label.mjs";
import "./pc_check.mjs";
import "./pc_radio.mjs";

export class PiCoMenu extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                border-color: var(--bdc);
                border-radius: .25em;
                box-shadow: 0 0 5px rgba(0,0,0,.25);
                display: none;
                position: absolute;
                transition: all ease-in-out 300ms;
                left: 100%;
                background-color: var(--mnu-bgc);
                color: var(--mnu-fgc);
                padding: .3em;
                font-size: .85em;
            }
            content {
                display: flex;
                width: 100%;
            }
            hr {
                border: none;
                border-top: .5px solid var(--bdc);
                margin: .1em 0;
            }   
        `
    }
    htm() {
        return "<content></content>"
    }
    
    onCreation() {
        const root = this.shadowRoot
        this.content = root.querySelector('content')
        const items = Array.from(this.children)
        this.innerHTML = ''
        customElements.whenDefined('pc-menu-item').then(() => {
            items.forEach(c => {
                if (c.tagName == 'LINE') {
                    const nl = document.createElement('hr')
                    this.content.appendChild(nl)
                } else if (c.tagName == 'ITEM') {
                    const options = c.getAttribute('enum')
                    if (options) {
                        let nib = new PiCoMenuButtonItem()
                        nib.innerHTML = c.innerHTML
                        for (let attr of c.attributes) {
                            if (attr.name != 'enum') ni.setAttribute(attr.name, attr.value)
                        }
                        this.content.appendChild(nib)
                        nib.setAttribute('enum', options)
                    } else {
                        const submenu = c.getAttribute('menu')
                        let ni = null
                        if (submenu) {
                            ni = new PiCoMenuButtonItem()
                            ni.innerHTML = c.innerHTML
                            for (let attr of c.attributes) {
                                if (attr.name != 'menu') ni.setAttribute(attr.name, attr.value)
                            }
                            this.content.appendChild(ni)
                            ni.setAttribute('menu', submenu)
                        } else {
                            ni = new PiCoMenuItem()
                            ni.setAttribute('label', c.innerHTML)
                            for (let attr of c.attributes) {
                                if (attr.name != 'menu') ni.setAttribute(attr.name, attr.value)
                            }
                            this.content.appendChild(ni)
                        }
                    }
                }
            })

        })
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'side', 'direction']
    }
    _set_side(v) {
        switch (v) {
            case "left":
                this.style.left = "auto"
                this.style.right = "calc(100% + 1px)"
                this.style.top = "-.5px"
                this.style.bottom = "auto"
                break;
            case "right":
                this.style.left = "calc(100% + 1px)"
                this.style.right = "auto"
                this.style.top = "-.5px"
                this.style.bottom = "auto"
                break;
            case "top":
                this.style.left = "-.5px"
                this.style.right = "auto"
                this.style.top = "auto"
                this.style.bottom = "calc(100% + 1px)"
                break;
            default: // "bottom":
                this.style.left = "-.5px"
                this.style.right = "auto"
                this.style.top = "calc(100% + 1px)"
                this.style.bottom = "auto"
                break;
        }
        this.__setTransformOrigin()
    }
    _set_direction(v) {
        this.content.style.flexDirection = v == 'vertical' ? "column" : "row"
        this.style.transform = v == 'vertical' ? "scaleY(0)" : "scaleX(0)"
        this.__setTransformOrigin()
    }
    __setTransformOrigin() {
        const side = this.getAttribute('side')
        const direction = this.getAttribute('direction')
        if (direction == 'vertical') {
            if (side == 'top') this.style.transformOrigin = 'bottom'
            else this.style.transformOrigin = 'top'
            // let len = this.content.children.length
            // if (len) {
            //     this.content.children[0].style.borderRadius = '.25em .25em 0 0'
            //     this.content.children[len - 1].style.borderRadius = '0 0 .25em .25em'
            // }
        } else {
            if (side == 'left') this.style.transformOrigin = 'right'
            else this.style.transformOrigin = 'left'
            // let len = this.content.children.length
            // if (len) {
            //     this.content.children[0].style.borderRadius = '.25em 0 0 .25em'
            //     this.content.children[len - 1].style.borderRadius = '0 .25em .25em 0'
            // }
        }
    }

    toggle(v) {
        const scale = this.content.style.flexDirection == 'column' ? 'scaleY' : 'scaleX'
        if (v === true) this.style.transform = `${scale}(1)`
        else if (v === false) this.style.transform = `${scale}(0)`
        else this.style.transform = this.style.transform == `${scale}(0)` ? `${scale}(1)` : `${scale}(0)`
        this.__toogleSubmenus()
    }
    __toogleSubmenus() {
        const mbi = this.content.querySelectorAll('pc-menubutton-item')
        mbi.forEach(mb => mb.menu.toggle(false))
    }

    disable(itemIndex) {
        setTimeout(_ => this.content.children[itemIndex]?.setAttribute('disabled', ''))
    }
    enable(itemIndex) {
        setTimeout(_ => this.content.children[itemIndex]?.removeAttribute('disabled'))
    }
}
try { customElements.define('pc-menu', PiCoMenu) } catch { }



export class PiCoMenuItem extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: .25em;
                padding: 0 .5em;
                cursor: pointer;
                user-select: none;
                white-space: nowrap;
                gap: .25em;
            }
            :host(:hover) {
                background-color: var(--mnu-hlc);
                color: white;
            }
            :host([disabled]) {
                opacity: .3;
                cursor: not-allowed;
            }
            pc-icon {
                display: none;
                border: none;
                width: 1em;
            }
            pc-label {
                display: none;
                border: none;
                flex: 1;
                justify-content: start;
            }
            pc-check, pc-radio {
                display: none;
                background-color: hsl(0, 0%, 95%);
            }
        `
    }
    htm() {
        return '<pc-check></pc-check><pc-radio group="A"></pc-radio><pc-icon name="home"></pc-icon><pc-label text="label"></pc-label>'
    }

    onCreation() {
        const root = this.shadowRoot
        this.check = root.querySelector('pc-check')
        this.radio = root.querySelector('pc-radio')
        this.icon = root.querySelector('pc-icon')
        this.label = root.querySelector('pc-label')
        this.label.setAttribute('text', this.innerHTML)
        this.setAttribute('label', this.innerHTML)
        this.innerHTML = ''
        this.check.click = () => { }
        const ne = new Event('item-selected', { bubbles: true, composed: true })
        ne.value = this.labelText
        this.addEventListener('pointerup', e => {
            const t = e.target
            if (t.hasAttribute('check')) {
                e.stopImmediatePropagation()
                ne.value = this.check.toggle()
            } else if (t.hasAttribute('radio')) {
                e.stopImmediatePropagation()
                const radios = this.parentElement.querySelectorAll('pc-menu-item[radio]')
                radios.forEach(r => r.radio.value = false)
                ne.value = this.radio.value = true
            } else if (t.hasAttribute('states')) {
                this.currentState = (this.currentState + 1) % this.states.length
                ne.value = this.states[this.currentState]
                this.label.setAttribute('text', ne.value)
            }
            ne.source = this
            ne.action = this.action
            this.dispatchEvent(ne)
        })
    }

    onInitialization() {
        if (this.hasAttribute('icon')) this._set_icon(this.getAttribute('icon'))
        if (this.hasAttribute('label')) this._set_label(this.getAttribute('label'))
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'disabled', 'icon', 'label', 'action', 'check', 'radio', 'states']
    }
    _set_disabled(v) {
        if (v !== null) this.style.pointerEvents = 'none'
        else this.style.pointerEvents = 'auto'
    }
    _set_icon(v) {
        if (v == null) this.icon.style.display = 'none'
        else { this.icon.setAttribute('name', v); this.icon.style.display = "inline-flex" }
        if (!this.action && v) this.action = v
    }
    _set_label(v) {
        if (v == null) this.label.style.display = 'none'
        else { this.label.setAttribute('text', v); this.label.style.display = "inline-flex" }
        if (v) this.action = v || 'action'
        this.labelText = v
    }
    _set_action(v) {
        this.action = v
    }
    _set_check(v) {
        if (v == null) this.check.style.display = 'none'
        else this.check.style.display = 'inline-flex'
    }
    _set_radio(v) {
        if (v == null) this.radio.style.display = 'none'
        else this.radio.style.display = 'inline-flex'
    }
    _set_states(v) {
        if (v) {
            this.states = v.split(',').map(s => s.trim())
            this.currentState = 0
            this.label.setAttribute('text', this.states[this.currentState])
            this.icon.style.display = 'inline-flex'
            this.icon.setAttribute('name', 'skip_next')
        } else {
            this.label.setAttribute('text', this.labelText)
            this.icon.style.display = 'none'
        }
    }
}
try { customElements.define('pc-menu-item', PiCoMenuItem) } catch { }



export class PiCoMenuButtonItem extends PiCoMenuItem {
    css() {
        return super.css() + `
            :host {
                padding: 0;
            }
            :host(:hover) {
                background-color: var(--mnu-hsc);
                color: white;
            }
            content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1em;
                min-width: 9em;
                padding: 0 .5em;
            }
            content:hover {
                background-color: var(--mnu-hlc);
                color: white;
            }
            pc-icon#arrow {
                display: inline-flex;
                border: none;
                cursor: pointer;
                user-select: none;
                width: .5em;
            }
        `
    }
    htm() {
        return '<content><slot></slot><pc-icon id="arrow">chevron_right</pc-icon></content><slot name="menu"></slot>'
    }

    onCreation() {
        const root = this.shadowRoot
        this.content = root.querySelector('content')
        // let menuName = this.getAttribute('menu')
        // if (menuName) this.menu = document.querySelector(`pc-menu[name=${menuName}]`)
        // else { }
        // this.menu.setAttribute('slot', 'menu')
        // this.menu.style.display = "flex"
        // this.appendChild(this.menu)
        this.content.addEventListener('pointerdown', e => {
            e.stopPropagation()
            this.menu.toggle()
        })
    }

    onInitialization() {
        if (!this.hasAttribute('side')) this.setAttribute('side', 'right')
        if (!this.hasAttribute('direction')) this.setAttribute('direction', 'vertical')
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'menu', 'enum', 'side', 'direction']
    }
    _set_side(v) {
        if (this.menu) this.menu.setAttribute('side', v)
    }
    _set_direction(v) {
        if (this.menu) this.menu.setAttribute('direction', v)
    }
    _set_menu(v) {
        if (v) {
            this.menu = document.querySelector(`pc-menu[name=${v}]`)
            console.log(this.menu, v)
            this.menu.setAttribute('slot', 'menu')
            this.menu.style.display = "flex"
            this.appendChild(this.menu)
            this.menu.setAttribute('side', this.getAttribute('side'))
            this.menu.setAttribute('direction', this.getAttribute('direction'))
        }
    }
    _set_enum(v) {
        if (v) {
            const opts = v.split(',').map(o => o.trim())
            const div = document.createElement('div')
            let html = `<pc-menu>`
            opts.forEach(o => {
                html += `<item label="${o}"></item>`
            })
            html += `</pc-menu>`
            div.innerHTML = html
            this.menu = div.firstChild
            this.menu.setAttribute('slot', 'menu')
            this.menu.style.display = "flex"
            this.appendChild(this.menu)
            this.menu.setAttribute('side', this.getAttribute('side'))
            this.menu.setAttribute('direction', this.getAttribute('direction'))
        }
    }
}
try { customElements.define('pc-menubutton-item', PiCoMenuButtonItem) } catch { }


export class PiCoMenuButton extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                display: inline-flex;
                border-color: var(--bdc);
                border-radius: .25em;
                box-shadow: 0 0 5px rgba(0,0,0,.25);
                position: relative;
                background-color: var(--mnu-bgc);
                color: var(--mnu-fgc);
                width: calc(1.5em + 1px);
                height: calc(1.5em + 1px);
                z-index: 100000;
            }
            :host(:hover) {
                background-color: var(--mnu-hsc);
                color: white;
            }
            modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                display: none;
            }
            pc-icon {
                border: none;
                border-radius: .24em;
                cursor: pointer;
                user-select: none;
            }
            pc-icon:hover {
                background-color: var(--mnu-hlc);
                color: white;
            }
        `
    }
    htm() {
        return `
            <modal></modal>
            <pc-icon>menu</pc-icon>
            <slot name="menu"></slot>
        `
    }

    onCreation() {
        const root = this.shadowRoot
        let menuName = this.getAttribute('menu')
        this.modal = root.querySelector('modal')
        this.icon = root.querySelector('pc-icon')
        this.menu = document.querySelector(`pc-menu[name=${menuName}]`)
        this.menu.setAttribute('slot', 'menu')
        this.menu.style.display = "flex"
        this.appendChild(this.menu)
        this.icon.addEventListener('pointerdown', e => {
            this.modal.style.display = "block"
            this.menu.toggle()
        })
        this.menu.addEventListener('item-selected', e => {
            if (e.source.hasAttribute('check')) return
            if (e.source.hasAttribute('radio')) return
            if (e.source.hasAttribute('states')) return
            this.modal.style.display = "none"
            this.menu.toggle(false)
        })
        this.modal.addEventListener('pointerdown', e => {
            this.modal.style.display = "none"
            this.menu.toggle(false)
        })
        this.modal.addEventListener('pointerup', e => {
            this.modal.style.display = "none"
            this.menu.toggle(false)
        })
    }

    onInitialization() {
        if (!this.hasAttribute('side')) this.setAttribute('side', 'bottom')
        if (!this.hasAttribute('direction')) this.setAttribute('direction', 'vertical')
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'side', 'direction']
    }
    _set_side(v) {
        this.menu.setAttribute('side', v)
    }
    _set_direction(v) {
        this.menu.setAttribute('direction', v)
    }

    toggle(v) {
        this.menu.toggle(v)
    }
}
try { customElements.define('pc-menu-button', PiCoMenuButton) } catch { }

