/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_win.mjs
 *  Description: Component to realize draggable, resizable, and iconizzable window
 */

import { evm } from './events.mjs'
import { PiCoComponent } from './pc_component.mjs'
import { PiCoContainer } from './pc_container.mjs'
import { PiCoIcon } from './pc_icon.mjs'
import { PiCoMovable } from './pc_movable.mjs'

export class PiCoWin extends PiCoMovable {
    css() {
        return `
            :host {
                box-sizing: border-box;
                min-width: 12em;
                min-height: 9em;
                position: absolute;
                display: grid;
                grid-template-rows: min-content min-content auto;
                overflow: hidden;
                border: .05em solid hsl(0 0 75/.75);
                border-radius: .25em;
                resize: both;
                left: 50px;
                top: 100px;
                box-shadow: 0px 0px 3px 0px hsla(0, 0%, 50%, .5);
                outline:none!important;
            }
            titlebar {
                box-sizing: border-box;
                height: 2em;
                display: grid;
                grid-template-columns: 3em auto 1em;
                align-items: center;
                background-color: hsl(0 0 20/80);
                color: hsl(0 0 90);
                cursor: default;
                border-radius: .3em .3em 0 0;
                padding: 0 .5em;
                -webkit-user-select: none; /* Safari/iOS */
                -ms-user-select: none;     /* IE/Edge */
                user-select: none;
                touch-action: none;
            }
            titlename {
                line-height: 2em;
                padding: 0 .5em;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                pointer-events: none;
            }
            cntr {
                display: flex;
                padding: 0 .3em;
                gap: .3em;
                font-size: .7em;
                height: 1em;
                width: 3.6em;
                align-self: center;
            }
            pc-icon {
                height: 1.2em;
                width: 1.2em;
                font-size: .8em;
                padding: .3em .3em .2em;
                border-radius: 50%;
                color: transparent;
                cursor: pointer;
            }
            pc-icon#close {
                background-color: #EC6A5E;
            }
            [name=remove] {
                background-color: #F5BF4F;
            }
            [name=fullscreen] {
                background-color: #61C555;
            }
            [name=dot] {
                background-color: var(--titlebar-fg);
                font-size: .6em;
                align-self: center;
            }
            viewport {
                display: block;
                position: relative;
                --background-color: hsla(0,5%,15%,1);
                width: 100%;
                height: 100%;
                overflow: scroll;
                --border: 1px solid black;
                --border-radius: 0 0 .5em .5em;
                box-sizing: border-box;
                padding: 0;
                --place-self: center;
            }
            resize {
                position: absolute;
                width: 30px;
                height: 30px;
                bottom: -21px;
                right: -21px;
                background-color: #555;
                border-radius: 1px;
                cursor: se-resize;
                background-image: url(/lib/v1.1/assets/images/resize.png);
                background-size: 14px 14px;
                opacity: .5;
                transform: rotateZ(-45deg);
            }
        `         
    }
    htm() {
        return `
            <titlebar>
                <cntr>
                    <pc-icon id="close" name="close" weight="500"></pc-icon>
                    <pc-icon name="remove" weight="500"></pc-icon>
                    <pc-icon name="fullscreen" weight="500"></pc-icon>
                </cntr>
                <titlename>Title</titlename>
                <pc-icon name="dot" weight="500"></pc-icon>
            </titlebar>
            <toolbar part="toolbar">
                <slot name="toolbar"></slot>
            </toolbar>
            <viewport part="viewport">
                <slot name="content"></slot>
            </viewport>
            <resize></resize>
        `
    }
    onCreation() {
        let main = this.shadowRoot
        this.titlebar = main.querySelector('titlebar')
        this.toolbar = main.querySelector('toolbar')
        this.viewport = main.querySelector('viewport')
        this.cntr = this.titlebar.children[0]
        this.iconClose = this.cntr.children[0]
        this.iconMinimize = this.cntr.children[1]
        this.iconFullscreen = this.cntr.children[2]
        this.titlename = this.titlebar.children[1]
        this.iconScroll = this.titlebar.children[2]

        this._createWindowManager()
        PiCoWin.register(this)


    }

    onFirstConnected() {
        this.titlebar.addEventListener('pointerdown', e=>{
            if (!this.__fullscreen) this.toggleMovement(true)
        })
        this.titlebar.addEventListener('pointerup', e=>{
            this.toggleMovement(false)
            let x = parseFloat(this.style.left)
            let y = parseFloat(this.style.top)
            if (this.__minimized) {
                this.__mm_left = x+'px'
                this.__mm_top = y+'px'
            } else if (!this.__fullscreen) {
                this.__left = x+'px'
                this.__top = y+'px'
            }
        })

        let main = this.shadowRoot
        let st = getComputedStyle(this)
        this.style.left = this.x?this.x+'px':st.left 
        this.style.top = this.y?this.y+'px':st.top
        this.__minWidth = Math.max(parseFloat(st.minWidth),150)
        this.__minHeight = Math.max(parseFloat(st.minHeight),150)
        this.style.minWidth = this.__minWidth+'px'
        this.style.minHeight = this.__minHeight+'px'
        this.style.width = Math.max(parseFloat(st.width),this.__minWidth)+'px'
        this.style.height = Math.max(parseFloat(st.height),this.__minHeight)+'px'
        this.__width = this.style.width
        this.__height = this.style.height

        this.__resize = st.resize
        this.__resizeDisp = st.resize == 'none'?'none':'inline'
        this.style.resize = 'none'

        this.resize = main.querySelector('resize')
        this.resize.style.display = this.__resizeDisp
        this.resize.addEventListener('pointerdown',e=>evm.target = this.resize)
        this.resize.move = (sp,ep,dp)=>{
            let w = parseFloat(this.style.width)+dp.x
            w = w<this.__minWidth?this.__minWidth:w
            let h = parseFloat(this.style.height)+dp.y
            h = h<this.__minHeight?this.__minHeight:h
            this.style.width = w+'px'
            this.style.height = h+'px'
            this.__width = this.style.width
            this.__height = this.style.height
        }

        this.cntr.addEventListener('pointerenter',()=>{
            this.iconClose.style.color = 'black'
            this.iconMinimize.style.color = 'black'
            this.iconFullscreen.style.color = 'black'
        })
        this.cntr.addEventListener('pointerleave',()=>{
            this.iconClose.style.color = 'transparent'
            this.iconMinimize.style.color = 'transparent'
            this.iconFullscreen.style.color = 'transparent'
        })

        this.iconClose.addEventListener('pointerup',this.hide.bind(this))

        this.iconMinimize.addEventListener('pointerup',()=>{
            if (this.__fullscreen) {
                this.__fullscreen = false
                this.style.left = this.__left
                this.style.top = this.__top
                this.style.width = this.__width
                this.style.height = this.__height
            }
            if (this.__minimized) {
                this.__minimized = false
                this.style.height = this.__height
                this.style.minHeight = this.__minHeight
                this.resize.style.display = this.__resizeDisp
                this.style.left = this.__left
                this.style.top = this.__top
                this.style.width = this.__width
                this.style.minWidth = this.__minWidth

            } else {
                this.__minimized = true
                this.__height = this.style.height
                this.__minWidth = this.style.minWidth
                this.style.height = '2em'
                this.style.minHeight = 0
                this.style.minWidth = '150px'
                this.style.width = '150px'
                this.resize.style.display = 'none'
                this.style.left = this.__mm_left
                this.style.top = this.__mm_top
            }
            
        })
        this.iconFullscreen.addEventListener('pointerup',()=>{
            if (this.__minimized) {
                this.__minimized = false
                this.style.left = this.__left
                this.style.top = this.__top
                this.style.width = this.__width
                this.style.height = this.__height
            }
            if (this.__fullscreen) {
                this.__fullscreen = false
                this.style.left = this.__left
                this.style.top = this.__top
                this.style.width = this.__width
                this.style.height = this.__height
                this.resize.style.display = this.__resizeDisp
            } else {
                this.__fullscreen = true
                this.__left = this.style.left
                this.__top = this.style.top
                this.__width = this.style.width
                this.__height = this.style.height
                this.style.left = 0;
                this.style.top = 0;
                this.style.width = '100%'
                this.style.height = '100%'
                this.resize.style.display = 'none'
            }
        })
        this.iconScroll.style.backgroundColor = 'white'
        this.iconScroll.addEventListener('click', e=>{
            let bg = this.iconScroll.style.backgroundColor
            this.iconScroll.style.backgroundColor = bg=='white'?'gray':'white'
            this.enableScroll(bg!='white')
        })


    }

    static get observedAttributes() { 
        return [...PiCoComponent.observedAttributes, 'name']
    }
    get name() { return this.titlename.innerHTML }
    set name(v) { this.titlename.innerHTML = v}


    _createWindowManager() {
        if (!PiCoWin.windows) {
            PiCoWin.windows = []
            PiCoWin.register = function(win) {
                PiCoWin.windows.push(win)
            }
            PiCoWin.closeAll = function() {
                PiCoWin.windows.forEach(w=>PiCoWin.close(w))
            }
            PiCoWin.close = function(win) {
                win.style.display = 'none'
            }
            PiCoWin.bringToFront = function(win) {
                PiCoWin.windows = PiCoWin.windows.filter(w=>w!=win)
                PiCoWin.windows.push(win)
                let zi = 1000
                PiCoWin.windows.forEach(w=>w.style.zIndex = zi++)
            }
        }
    }

    enableScroll(v) {
        this.viewport.style.overflow = v?'scroll':'hidden'
    }
    
    show() {
        this.style.display = 'grid'
        PiCoWin.bringToFront(this)
    }
    hide() {
        if (this.onHide && this.onHide()) {
            this.style.display = 'none'
        } else this.style.display = 'none'
    }
    toggle(on) {
        if (on!=undefined) this.style.display = on?'grid':'none'
        else this.style.display = this.style.display=='grid'?'none':'grid'
    }
}

try { customElements.define('pc-win', PiCoWin) } catch {}