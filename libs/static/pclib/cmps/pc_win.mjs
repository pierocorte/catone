/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_win.mjs
 *  Description: Component to realize draggable, resizable, and iconizzable window
 */


import { PiCoComponent } from './pc_component.mjs'
import { PiCoContainer } from './pc_container.mjs'
import './pc_icon.mjs'

export class PiCoWin extends PiCoContainer {
    css() {
        return super.css() + `
            :host {
                position: absolute;
                display: flex;
                flex-direction: column;
                border: .2em solid hsla(0,0%,70%,.5);
                border-radius: .25em;
                width: 16em;
                height: 9em;
                --overflow: hidden;
                box-shadow: 0 0 5px rgba(0,0,0,.25);
                --padding: .2em;
                background-color: hsla(0,0%,70%,.5);
            }
            titlebar {
                box-sizing: border-box;
                height: 1.5em;
                display: flex;
                align-items: center;
                background-color: var(--fgc);
                color: var(--bgc);
                padding: 0 .5em;
            }
            titlename {
                flex: 1;
                padding: 0 .5em;
                font-size: .9em;
            }
            cntr {
                display: flex;
                gap: .25em;
                font-size: .7em;
            }
            pc-icon {
                height: .99em;
                width: .99em;
                border-radius: 50%;
                cursor: pointer;
            }
            pc-icon::part(icon) {
                position: relative;
                color: black;
                font-size: .6em;
            }
            [name=close] {
                background-color: #EC6A5E;
            }
            [name=remove] {
                background-color: #F5BF4F;
            }
            [name=fullscreen] {
                background-color: #61C555;
            }
            [name=expansion_panels] {
                background-color: #FFFFFF;
            }
            viewport {
                box-sizing: border-box;
                display: block;
                position: relative;
                background-color: hsla(0,0%,70%,.9);
                width: 100%;
                height: 100%;
                overflow: scroll;
            }
            resize {
                position: absolute;
                width: 3px;
                height: 3px;
                bottom: -2px;
                right: -2px;
                border-bottom: 2px double var(--fgc);
                border-right: 2px double var(--fgc);
                border-radius: 0 0 .2em 0;
                cursor: se-resize;
                z-index: 100;
            }

            .glass {
                position: relative;
                border: 1px solid rgba(255, 255, 255, 0.58);
                background: rgba(180, 220, 250, 0.1);
            }

            .glass::before {
                content: "";
                position: absolute;
                inset: 0;
                display: block;
                background: rgba(180, 220, 250, 0.1);
                backdrop-filter: blur(18px);
                z-index: -1;
                border-radius: inherit;
            }
        `
    }

    htm() {
        return `
            <titlebar>
                <cntr>
                    <pc-icon id="close" name="close" weight="500"></pc-icon>
                    <pc-icon id="minimize" name="remove" weight="500"></pc-icon>
                    <pc-icon id="fullscreen" name="fullscreen" weight="500"></pc-icon>
                </cntr>
                <titlename>Title</titlename>
                <cntr>
                    <pc-icon id="scroll" name="expansion_panels" weight="500"></pc-icon>
                </cntr>
            </titlebar>
            <viewport part="viewport">
                ${super.htm()}
            </viewport>
            <resize></resize>
        `
    }

    onCreation() {
        const root = this.shadowRoot
        this.titlebar = root.querySelector('titlebar')
        this.viewport = root.querySelector('viewport')
        this.iconClose = this.titlebar.querySelector('pc-icon#close')
        this.iconMinimize = this.titlebar.querySelector('pc-icon#minimize')
        this.iconFullscreen = this.titlebar.querySelector('pc-icon#fullscreen')
        this.iconScroll = this.titlebar.querySelector('pc-icon#scroll')
        this.titlename = this.titlebar.querySelector('titlename')
        this.resize = root.querySelector('resize')

        let cs = getComputedStyle(this)
        this.style.left = cs.left
        this.style.top = cs.top

        const self = this
        let bb = null
        let sp = null
        let target = null
        let clicked = null
        let moving = false
        function down(e) {
            if (self.fullscreen) return
            target = e.target
            window.addEventListener('pointermove', move)
            window.addEventListener('pointerup', up)
            bb = self.getBoundingClientRect()
            sp = { x: e.clientX - bb.x, y: e.clientY - bb.y }
        }
        function move(e) {
            moving = true
            const t = e.target
            const x = e.clientX - sp.x
            const y = e.clientY - sp.y
            if (target == self.resize) {
                let nw = e.clientX - parseFloat(self.style.left)
                let nh = e.clientY - parseFloat(self.style.top)
                self.style.width = nw + 'px'
                self.style.height = nh + 'px'
            } else {
                self.style.left = x + 'px'
                self.style.top = y + 'px'
            }
        }
        function up(e) {
            if (moving) self.__storePosMem()
            moving = false
            clicked = null
            target == null
            window.removeEventListener('pointermove', move)
            window.removeEventListener('pointerup', up)
        }

        this.shadowRoot.addEventListener('pointerdown', e => {
            clicked = e.target
            this.parentElement.lastElementChild?.after(this)
        })
        this.titlebar.addEventListener('pointerdown', down)
        this.resize.addEventListener('pointerdown', down)

        this.iconClose.addEventListener('pointerup', e => {
            if (moving) return
            if (clicked == this.iconClose) this.close()
        })
        this.iconMinimize.addEventListener('pointerup', e => {
            if (moving) return
            if (clicked == this.iconMinimize) this.toggleMinimize()
        })
        this.iconFullscreen.addEventListener('pointerup', e => {
            if (moving) return
            if (clicked == this.iconFullscreen) this.toggleFullscreen()
        })
        this.iconScroll.addEventListener('pointerup', e => {
            if (moving) return
            if (clicked == this.iconScroll) this.toggleScroll()
        })

        this.__storePropsMem()

    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'title', 'noresize', 'title-bg']
    }
    _set_title(v) {
        this.titlename.innerHTML = v || 'title'
    }
    _set_noresize(v) {
        this.resize.style.display = v != null ? 'none' : 'block'
    }
    _set_titleBg(v) {
        if (v == null) this.titlebar.style.backgroundColor = 'var(--fgc)'
        else this.titlebar.style.backgroundColor = v
    }



    __storePropsMem() {
        this.__storePosMem()
        this.__propsMem.minHeight = this.style.minHeight
        this.__propsMem.height = this.style.height
        this.__propsMem.maxHeight = this.style.maxHeight
        this.__propsMem.minWidth = this.style.minWidth
        this.__propsMem.width = this.style.width
        this.__propsMem.maxWidth = this.style.maxWidth
        this.__propsMem.noresize = this.getAttribute('noresize')
    }
    __storePosMem() {
        if (!this.__propsMem) this.__propsMem = {}
        if (this.minimized) {
            this.__propsMem.leftWhenMin = this.style.left
            this.__propsMem.topWhenMin = this.style.top
        } else {
            this.__propsMem.left = this.style.left
            this.__propsMem.top = this.style.top
        }
    }

    close() {
        this.hide()
        this.dispatchEvent(new CustomEvent('close'))
    }
    toggleMinimize() {
        if (this.fullscreen) this.toggleFullscreen()
        this.minimized = !this.minimized
        if (this.minimized) {
            this.viewport.style.display = 'none'
            this.style.left = this.__propsMem.leftWhenMin
            this.style.top = this.__propsMem.topWhenMin
            this.__storePropsMem()
            this.style.minHeight = 'unset'
            this.style.height = 'unset'
            this.style.minWidth = 'unset'
            this.style.width = 'unset'
            this.resize.style.display = 'none'
        } else {
            this.viewport.style.display = 'block'
            this.style.left = this.__propsMem.left
            this.style.top = this.__propsMem.top
            this.style.minHeight = this.__propsMem.minHeight
            this.style.height = this.__propsMem.height
            this.style.minWidth = this.__propsMem.minWidth
            this.style.width = this.__propsMem.width
            this.resize.style.display = this.getAttribute('noresize') != null ? 'none' : 'block'
        }
    }
    toggleFullscreen() {
        if (this.minimized) this.toggleMinimize()
        this.fullscreen = !this.fullscreen
        this.viewport.style.display = 'block'
        if (this.fullscreen) {
            this.style.left = 0
            this.style.top = 0
            this.style.maxHeight = 'unset'
            this.style.height = '100%'
            this.style.maxWidth = 'unset'
            this.style.width = '100%'
            this.resize.style.display = 'none'
        } else {
            this.style.left = this.__propsMem.left
            this.style.top = this.__propsMem.top
            this.style.maxHeight = this.__propsMem.maxHeight
            this.style.height = this.__propsMem.height
            this.style.maxWidth = this.__propsMem.maxWidth
            this.style.width = this.__propsMem.width
            this.resize.style.display = this.getAttribute('noresize') != null ? 'none' : 'block'
        }
    }
    toggleScroll() {
        this.scroll = !this.scroll
        this.iconScroll.style.backgroundColor = this.scroll ? 'white' : 'gray'
        this.viewport.style.overflow = this.scroll ? 'scroll' : 'hidden'
    }
}

try { customElements.define('pc-win', PiCoWin) } catch { }