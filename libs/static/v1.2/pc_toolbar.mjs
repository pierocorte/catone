/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_toolbar.mjs
 *  Description: Component to realize toolbars, popup menu and menubars
 */

import { PICO } from "./glob.mjs"
import { PiCoComponent } from "./pc_component.mjs"

export class PiCoToolbar extends PiCoComponent {
    template() {
        return `
            <style>
                toolbar {
                    box-sizing: border-box;
                    display: block;
                    width: 100%;
                    user-select: none;
                    font-family: Montserrat;
                    font-variation-settings: 'FILL' 0, 'GRAD' 0, 'opsz' 24, 'wght' 300;
                    font-size: 16px;
                    transition: transform ease-in-out .3s, opacity ease-in-out .3s;
                    border: 1px solid hsla(0, 9%, 45%, .5);
                    border-radius: .3em;
                    --bg: hsla(0, 9%, 95%, .9);
                    --fg: hsl(0,0%,0%);
                    --th: hsla(40, 70%, 75%, .9);
                    --justify: center;
                    --tbw: 0;   /* TOOL BORDER WIDTH */
                    --theight: 1.5em;
                    background-color: var(--bg);
                    color: var(--fg);
                    padding: .3em;
                    gap: 1px;
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    box-shadow: 0px 0px 3px 0px hsla(0, 0%, 50%, .5);
                }
                toolset {
                    width: 100%;
                    display: inline-flex;
                    position: relative;
                    gap: inherit;
                    align-items: center;
                }
                toolbar[dir=td] > toolset,
                toolbar[dir=bd] > toolset {
                    flex-direction: column;
                }
                line {
                    display: block;
                    background-color: var(--fg);
                    width: 100%;
                    height: 1px;
                    opacity: .3;
                    margin: .25em 0;
                }
                toolbar[dir=rd] > toolset > line,
                toolbar[dir=ld] > toolset > line {
                    height: var(--theight);
                    width: 1px;
                    margin: 0 .25em;
                }
                tool {
                    box-sizing: border-box;
                    position: relative;
                    display: inline-flex;
                    border-style: solid;
                    border-color: black;
                    border-width: var(--tbw);
                    border-radius: .2em;
                    gap: .2em;
                    padding: .2em .9em;
                    cursor: pointer;
                    align-items: center;
                    width: 100%;
                    height: var(--theight);
                    justify-content: var(--justify);
                }
                tool:active {
                    background-color: var(--th);
                    color: hsl(0 0 95/.95);
                }
                tool.open {
                    background-color: var(--th);
                }
                toolbar.open tool:hover {
                    background-color: var(--th);
                    color: hsl(0 0 95/.95);
                }
                tool.disabled {
                    pointer-events: none;
                    opacity: .5;
                    //background-color: hsla(0, 0%, 0%, .3);
                }
                icon {
                    box-sizing: border-box;
                    display: inline-grid;
                    place-content: center;
                    font-family: SymbolsRounded;
                    overflow: hidden;
                    cursor: inherit; 
                }
                label {
                    text-wrap: nowrap;
                    font-size: .8em;
                    cursor: inherit;
                }
                check {
                    display: grid;
                    border: 1px solid var(--fg);
                    border-radius: .1em;
                    font-size: .6em;
                    width: .9em;
                    height: .9em;
                    outline: hidden;
                    padding: .1em;
                    margin-left: .2em;
                    cursor: inherit; 
                }
                check.on {
                    background-color: hsla(210, 50%, 50%, 1);
                }
                check > icon {
                    color: white;
                    font-weight: 900;
                }
                toolvalue {
                    box-sizing: border-box;
                    width: 7em;
                    height: 100%;
                    padding: .2em;
                    border: 1px inset gray;
                    background-color: hsla(0, 0%, 0%, .1);
                    outline: none;
                    overflow: hidden;
                    text-wrap: nowrap;
                    font-size: .9em;
                    border-radius: .2em;
                }
                tool[input] {
                    display: flex;
                    padding: 0;
                    gap: .3em;
                }
                tool[input] > icon:first-child, tool[input] > label:first-child {
                    margin-left: .6em;
                }
            </style>
            <toolbar>
                <toolset>
                </toolset>
            </toolbar>
        `
    }
    onCreation() {
        this.style.display = 'inline-block'
        this.style.position = 'relative'
        this.toolbar = this.shadowRoot.querySelector('toolbar')
        this.toolset = this.toolbar.querySelector('toolset')
        this._createInnerTools()
        this._createToolbarManager()
        this.config(PICO.config)
        this.showing = false
    }
    static get observedAttributes() { 
        return ['side','dir','popup','width','config']
    }
    onAttributeChanged(name, oldValue, newValue) {
        switch (name) {
            case 'side': {
                this.toolbar.setAttribute('side', newValue)
                break
            }
            case 'dir': {
                this.toolbar.setAttribute('dir', newValue)
                break
            }
            case 'popup': {
                this.style.position = 'absolute'
                this.style.display = 'none'
                this.isPopup = true
                this.style.zIndex = -1000
                break
            }
            case 'width': {
                this.style.width = newValue
                break
            }
            case 'config': {
                let s = newValue.split(';')
                let so = {}
                s.forEach(d=>{
                    let [p,v] = d.split(':')
                    so[p]=v
                })
                this.config(so)
                break
            }
        }
    }

    _createToolbarManager() {
        if (!PiCoToolbar.openTools) {
            PiCoToolbar.openTools = []
            PiCoToolbar.closeAll = function() {
                PiCoToolbar.openTools.forEach(t=>PiCoToolbar.closeTool(t))
            }
            PiCoToolbar.closeTool = function(t) {
                t.status = 'close'
                t.classList.toggle('open',false)
                t.parentToolbar.status = 'close'
                t.parentToolbar.toolbar.classList.toggle('open',false)
                t.toolbar.hide()
                t.toolbar._closeChildrenToolbars()
            }
            PiCoToolbar.pointerDown = function(tool) {
                PiCoToolbar.timestamp = Date.now()
                PiCoToolbar.lastToolClicked = tool
                if (tool.status == 'close') {
                    tool.parentToolbar._closeChildrenToolbars()
                    let tbname = tool.getAttribute('toolbar')
                    if (!tool.toolbar && tbname!=null) {
                        tool.toolbar = document.querySelector(`pc-toolbar[name=${tbname}]`)
                    }
                    if (tool.toolbar) PiCoToolbar.open(tool)
                }
            }
            PiCoToolbar.pointerUp = function(tool) {
                if (tool.toolbar) {
                    let difftime = Date.now()-PiCoToolbar.timestamp
                    if (tool != PiCoToolbar.lastToolClicked || difftime > 300) PiCoToolbar.closeAll()
                    return    
                }
                let type = tool.getAttribute('type')
                switch (type) {
                    case 'option': {
                        let at = tool.parentToolbar.activatingTool
                        PiCoToolbar.closeTool(at)
                        at.parentToolbar.status = 'open'
                        at.parentToolbar.toolbar.classList.toggle('open',true)
                        break
                    }
                    case 'check':
                    case 'states': {
                        tool.parentToolbar.status = 'open'
                        tool.parentToolbar.toolbar.classList.toggle('open',true)
                        break
                    }
                    case 'simple': {
                        PiCoToolbar.closeAll()
                        break
                    }
                }
                tool.parentToolbar._onAction(tool)
            }
            PiCoToolbar.open = function(tool) { 
                tool.status = tool.parentToolbar.status = 'open'
                tool.classList.toggle('open',true)
                tool.parentToolbar.toolbar.classList.toggle('open',true)
                tool.toolbar.status = 'open'
                tool.toolbar.toolbar.classList.toggle('open',true)
                tool.toolbar.activatingTool = tool
                tool.toolbar._openToolbar(tool)
                PiCoToolbar.openTools.push(tool)
            }
            window.addEventListener('pointerdown', PiCoToolbar.closeAll.bind(PiCoToolbar))
            window.addEventListener('pointerup', PiCoToolbar.closeAll.bind(PiCoToolbar))
        }
    }

    _createInnerTools() {
        let tools = [...this.children]
        this.innerHTML = ''
        tools.forEach(t=>{
            this._configureTool(t)
            this.toolset.appendChild(t)
            t.parentToolbar = this
            t.status = t.parentToolbar.status = 'close'
            t.classList.toggle('open',false)
            t.parentToolbar.toolbar.classList.toggle('open',false)
        })
    }

    _configureTool(t) {
        t.addEventListener('pointerdown', e=>{
            e.stopPropagation()
            PiCoToolbar.pointerDown(t)
        }, true)
        t.addEventListener('pointerenter', e=>{
            if (t.parentToolbar.status == 'close') return
            if (t.status == 'close') {
                t.parentToolbar._closeChildrenToolbars(/*true*/)
                if (t.toolbar) PiCoToolbar.open(t)
            }
        })
        t.addEventListener('pointerup', e=>{
            e.stopPropagation()
            PiCoToolbar.pointerUp(t)
        }, true)

        if (t.getAttribute('check')!=null) { this._createCheckTool(t); return }
        if (t.getAttribute('states')!=null) { this._createStatesTool(t); return }
        if (t.getAttribute('enum')!=null) { this._createEnumTool(t); return }
        if (t.getAttribute('toolbar')!=null) { this._createToolbarTool(t); return }
        if (t.getAttribute('input')!=null) { this._createInputTool(t); return}
        this._createSimpleTool(t)
    }

    _createSimpleTool(t) {
        let type = t.getAttribute('type')
        t.setAttribute('type',type || 'simple')
        let icon = t.getAttribute('icon')
        if (icon!=null) t.innerHTML = '<icon>'+icon+'</icon>'
        let label = t.getAttribute('label')
        if (label!=null) t.innerHTML += '<label>'+label+'</label>'
        let action = t.getAttribute('action')
        if (action==null) t.setAttribute('action', label || icon)
    }

    _createCheckTool(t) {
        t.setAttribute('type','check')
        let icon = t.getAttribute('icon')
        if (icon!=null) t.innerHTML = '<icon>'+icon+'</icon>'
        let label = t.getAttribute('label')
        t.innerHTML += '<check><icon></icon></check>'
        if (label!=null) t.innerHTML += '<label>'+label+'</label>'
        let action = t.getAttribute('action')
        if (action==null) t.setAttribute('action', label || icon)
    }

    _createStatesTool(t) {
        t.setAttribute('type','states')
        let states = t.getAttribute('states')
        t.states = states.split(',')
        t.currentState = 0
        let [label,icon] = t.states[0].split(':')
        if (icon!=null) t.innerHTML = '<icon>'+icon+'</icon>'
        if (label!=null) t.innerHTML += '<label>'+label+'</label>'
    }

    _createEnumTool(t) {
        t.setAttribute('type','enum')
        let en = t.getAttribute('enum')
        en = en.split(',')
        let [label,icon] = en[0].split(':')
        if (icon!=null) t.innerHTML = '<icon>'+icon+'</icon>'
        if (label!=null) t.innerHTML += '<label>'+label+'</label>'
        let place = t.getAttribute('place') || ''
        let [side,dir] = place.split(' ')
        t.toolbarSide = side
        t.toolbarDir = dir
        let toollist = ''
        let index = 0
        en.forEach(td=>{
            let [label,icon,value] = td.split(':')
            toollist += '<tool type="option" index='+(index++)+(value?' value='+value:'')
            if (icon) toollist += ' icon="'+icon+'"'
            if (label) toollist += ' label="'+label+'"'
            toollist += '></tool>'
        })
        let tempdiv = document.createElement('div')
        tempdiv.innerHTML = `<pc-toolbar type="enum" popup>${toollist}</pc-toolbar>`
        t.toolbar = tempdiv.children[0]
        t.toolbar.addEventListener('action',e=>{
            let atool = e.tool.parentToolbar.activatingTool
            atool.innerHTML = e.tool.innerHTML
            let ev = new Event('action')
            ev.action = atool.getAttribute('action')
            ev.index = e.tool.getAttribute('index')
            ev.value = e.tool.getAttribute('value')
            ev.tool = atool
            this.dispatchEvent(ev)
        })
        document.documentElement.appendChild(t.toolbar)
    }

    _createToolbarTool(t) {
        t.setAttribute('type','toolbar')
        let icon = t.getAttribute('icon')
        if (icon!=null) t.innerHTML = '<icon>'+icon+'</icon>'
        let label = t.getAttribute('label')
        if (label!=null) t.innerHTML += '<label>'+label+'</label>'
        let toolbar = t.getAttribute('toolbar')
        let [name,side,dir] = toolbar.split(' ')
        t.toolbarSide = side
        t.toolbarDir = dir
        t.toolbar = document.querySelector(`pc-toolbar[name=${name}]`)
    }

    _createInputTool(t) {
        t.setAttribute('type','input')
        let tv = document.createElement('toolvalue')
        tv.setAttribute('contenteditable','')
        let icon = t.getAttribute('icon')
        if (icon!=null) t.innerHTML = '<icon>'+icon+'</icon>'
        let label = t.getAttribute('label')
        if (label!=null) t.innerHTML += '<label>'+label+'</label>'
        t.appendChild(tv)
        tv.addEventListener('keypress', e=>{
            if (e.key == 'Enter') {
                e.preventDefault()
                let ev = new Event('action')
                ev.action = t.getAttribute('action')
                ev.value = tv.innerText
                ev.tool = t
                this.dispatchEvent(ev)
                let at = t.parentToolbar.activatingTool
                PiCoToolbar.closeTool(at)
            }
        }) 

    }

    _openToolbar(tool) {
        // OPEN A SUB-TOOLBAR: it is appended first to the tool.toolset to proper compute the relative positioning
        tool.toolbar.style.position = 'absolute'
        tool.parentElement.appendChild(tool.toolbar)
        let r = {x:tool.offsetLeft,y:tool.offsetTop,width:tool.offsetWidth,height:tool.offsetHeight}
        let r1 = tool.parentElement.getBoundingClientRect()
        let r2 = tool.parentToolbar.getBoundingClientRect()
        let dtx =  (r2.width-r1.width)/2
        let dty =  (r2.height-r1.height)/2
        r.x-=dtx; r.y-=dty; r.width+=2*dtx; r.height+=2*dty
        let ptb = tool.parentElement.parentElement
        if (!tool.toolbarSide) tool.toolbar.toolbar.removeAttribute('side')
        if (!tool.toolbarDir) tool.toolbar.toolbar.removeAttribute('dir')
        tool.toolbar.show(r, 2, tool.toolbarSide, tool.toolbarDir, ptb.getAttribute('side'), ptb.getAttribute('dir'))
    }

    _closeChildrenToolbars(stayopen) {
        let tools = this.toolset.querySelectorAll('tool')
        tools.forEach(t=>{
            if (t.toolbar && t.status == 'open') {
                t.status = 'close'
                t.classList.toggle('open',false)
                t.toolbar.hide()
                t.toolbar._closeChildrenToolbars()
            }
        })
        // this.status = stayopen?'open':'close'
        // this.toolbar.classList.toggle('open',stayopen)
    }

    toggle(rect,gap,side,dir) {
        if (this.showing) this.hide()
        else this.show(rect,gap,side,dir)
    }
    show(rect,gap=0,side,dir,pside,pdir) {
        if (this.hidepid) {clearTimeout(this.hidepid); this.hidepid=0}
        if (side) this.toolbar.setAttribute('side',side)
        if (dir) this.toolbar.setAttribute('dir',dir)
        if (!this.toolbar.getAttribute('side')) {
            let side = (!pdir || pdir=='rd' || pdir=='ld')?'bs':'rs'
            this.toolbar.setAttribute('side',side)
        }
        if (!this.toolbar.getAttribute('dir')) {
            this.toolbar.setAttribute('dir','bd')
        }
        side = this.toolbar.getAttribute('side')
        dir = this.toolbar.getAttribute('dir')
        this.toolbar.style.transition = 'unset'
        this._prepareToShow()
        this.style.display = 'inline-block'
        this.showing = true
        setTimeout(()=>this._show(rect, gap, side, dir),1)
        //this._show(rect, gap, side, dir)
    }
    _prepareToShow() {
        let dir = this.toolbar.getAttribute('dir')
        switch (dir) {
            case 'td': {
                this.toolbar.style.transformOrigin = '50% 100%'
                this.toolbar.style.transform = 'scaleY(0)'
                break
            }
            case 'bd': {
                this.toolbar.style.transformOrigin = '50% 0%'
                this.toolbar.style.transform = 'scaleY(0)'
                break
            }
            case 'rd': {
                this.toolbar.style.transformOrigin = '0% 50%'
                this.toolbar.style.transform = 'scaleX(0)'
                break
            }
            case 'ld': {
                this.toolbar.style.transformOrigin = '100% 50%'
                this.toolbar.style.transform = 'scaleX(0)'
                break
            }
        }
    }
    _show(rect={x:0,y:0},gap=0,side,dir) {
        this.toolbar.style.transition = 'transform ease-in-out .3s, opacity ease-in-out .3s'
        let tr = this.getBoundingClientRect()
        switch (side) {
            case 'ts': {
                switch (dir) {
                    case 'td': {
                        this.style.left = (rect.x)+'px'
                        this.style.top = (rect.y - tr.height - gap)+'px'
                        this.toolbar.style.transformOrigin = '50% 100%'
                        this.toolbar.style.transform = 'scaleY(1)'
                        this.toolbar.style.opacity = 1    
                        break
                    }
                    case 'bd': {
                        this.style.left = (rect.x)+'px'
                        this.style.top = (rect.y)+'px'
                        this.toolbar.style.transformOrigin = '50% 0%'
                        this.toolbar.style.transform = 'scaleY(1)'
                        this.toolbar.style.opacity = 1
                        break
                    }
                    case 'rd': {
                        this.style.left = (rect.x)+'px'
                        this.style.top = (rect.y - tr.height - gap)+'px'
                        this.toolbar.style.transformOrigin = '0% 50%'
                        this.toolbar.style.transform = 'scaleX(1)'
                        this.toolbar.style.opacity = 1
                        break
                    }
                    case 'ld': {
                        this.style.left = (rect.x + rect.width - tr.width)+'px'
                        this.style.top = (rect.y - tr.height - gap)+'px'
                        this.toolbar.style.transformOrigin = '100% 50%'
                        this.toolbar.style.transform = 'scaleY(1)'
                        this.toolbar.style.opacity = 1 
                        break
                    }
                }
                break
            }
            case 'bs': {
                switch (dir) {
                    case 'td': {
                        this.style.left = (rect.x)+'px'
                        this.style.top = (rect.y + rect.height - tr.height)+'px'
                        this.toolbar.style.transformOrigin = '50% 100%'
                        this.toolbar.style.transform = 'scaleY(1)'
                        this.toolbar.style.opacity = 1
                        break
                    }
                    case 'bd': {
                        this.style.left = (rect.x)+'px'
                        this.style.top = (rect.y + rect.height + gap)+'px'
                        this.toolbar.style.transformOrigin = '50% 0%'
                        this.toolbar.style.transform = 'scaleY(1)'
                        this.toolbar.style.opacity = 1
                        break
                    }
                    case 'rd': {
                        this.style.left = (rect.x)+'px'
                        this.style.top = (rect.y + rect.height + gap)+'px'
                        this.toolbar.style.transformOrigin = '0% 50%'
                        this.toolbar.style.transform = 'scaleX(1)'
                        this.toolbar.style.opacity = 1
                        break
                    }
                    case 'ld': {
                        this.style.left = (rect.x + rect.width - tr.width)+'px'
                        this.style.top = (rect.y + rect.height + gap)+'px'
                        this.style.bottom = 'unset'
                        this.toolbar.style.transformOrigin = '100% 50%'
                        this.toolbar.style.transform = 'scaleY(1)'
                        this.toolbar.style.opacity = 1     
                        break
                    }

                }
                break
            }
            case 'rs': {
                switch (dir) {
                    case 'td': {
                        this.style.left = (rect.x + rect.width + gap)+'px'
                        this.style.top = (rect.y + rect.height - tr.height)+'px'
                        this.toolbar.style.transformOrigin = '50% 100%'
                        this.toolbar.style.transform = 'scaleY(1)'
                        this.toolbar.style.opacity = 1
                        break
                    }
                    case 'bd': {
                        this.style.left = (rect.x + rect.width + gap)+'px'
                        this.style.top = (rect.y)+'px'
                        this.toolbar.style.transformOrigin = '50% 0%'
                        this.toolbar.style.transform = 'scaleY(1)'
                        this.toolbar.style.opacity = 1
                        break
                    }
                    case 'rd': {
                        this.style.left = (rect.x + rect.width + gap)+'px'
                        this.style.top = (rect.y)+'px'
                        this.toolbar.style.transformOrigin = '0% 50%'
                        this.toolbar.style.transform = 'scaleX(1)'
                        this.toolbar.style.opacity = 1
                        break
                    }
                    case 'ld': {
                        this.style.left = (rect.x + rect.width - tr.width)+'px'
                        this.style.top = (rect.y)+'px'
                        this.toolbar.style.transformOrigin = '100% 50%'
                        this.toolbar.style.transform = 'scaleY(1)'
                        this.toolbar.style.opacity = 1     
                        break
                    }

                }
                break
            }
            case 'ls': {
                switch (dir) {
                    case 'td': {
                        this.style.left = (rect.x - tr.width - gap)+'px'
                        this.style.top = (rect.y + rect.height - tr.height)+'px'
                        this.toolbar.style.transformOrigin = '50% 100%'
                        this.toolbar.style.transform = 'scaleY(1)'
                        this.toolbar.style.opacity = 1
                        break
                    }
                    case 'bd': {
                        this.style.left = (rect.x - tr.width - gap)+'px'
                        this.style.top = (rect.y)+'px'
                        this.toolbar.style.transformOrigin = '50% 0%'
                        this.toolbar.style.transform = 'scaleY(1)'
                        this.toolbar.style.opacity = 1
                        break
                    }
                    case 'rd': {
                        this.style.left = (rect.x)+'px'
                        this.style.top = (rect.y)+'px'
                        this.toolbar.style.transformOrigin = '0% 50%'
                        this.toolbar.style.transform = 'scaleX(1)'
                        this.toolbar.style.opacity = 1
                        break
                    }
                    case 'ld': {
                        this.style.left = (rect.x - tr.width - gap)+'px'
                        this.style.top = (rect.y)+'px'
                        this.toolbar.style.transformOrigin = '100% 50%'
                        this.toolbar.style.transform = 'scaleY(1)'
                        this.toolbar.style.opacity = 1     
                        break
                    }

                }
                break
            }
        }
        this.style.zIndex = 10000
    }
    hide() {
        let dir = this.toolbar.getAttribute('dir')
        switch (dir) {
            case 'td': {
                this.toolbar.style.transformOrigin = '50% 100%'
                this.toolbar.style.transform = 'scaleY(0)'
                break
            }
            case 'bd': {
                this.toolbar.style.transformOrigin = '50% 0%'
                this.toolbar.style.transform = 'scaleY(0)'
                break
            }
            case 'rd': {
                this.toolbar.style.transformOrigin = '0% 50%'
                this.toolbar.style.transform = 'scaleX(0)'
                break
            }
            case 'ld': {
                this.toolbar.style.transformOrigin = '100% 50%'
                this.toolbar.style.transform = 'scaleX(0)'
                break
            }
        }
        this.showing = false
        this.hidepid = setTimeout(()=>{
            this.style.zIndex = -10000
            this.style.left = this.style.top = '-10000px'
        },300)
    }

    _onAction(tool) {
        let type = tool.getAttribute('type')
        if (type =='check') {
            let check = tool.querySelector('check')
            let icon = check.children[0]
            let on = icon.innerHTML == 'check'
            on = !on
            if (on) icon.innerHTML = 'check'
            else icon.innerHTML = ''
            check.classList.toggle('on',on)
            let ev = new Event('action')
            ev.action = tool.getAttribute('action')
            ev.index = on?1:0
            ev.value = on
            ev.tool = tool
            this.dispatchEvent(ev)
            return
        }
        if (type =='states') {
            tool.currentState = (tool.currentState+1)%tool.states.length
            let [nlabel,nicon,value] = tool.states[tool.currentState].split(':')
            tool.innerHTML = ''
            if (nicon) tool.innerHTML += `<icon>${nicon}</icon>`
            if (nlabel) tool.innerHTML += `<label>${nlabel}</label>`
            let ev = new Event('action')
            ev.action = tool.getAttribute('action')
            ev.index = tool.currentState
            ev.value = value
            ev.tool = tool
            this.dispatchEvent(ev)
            return
        }
        if (type == 'input') {
            return
        }
        let ev = new Event('action')
        ev.action = tool.getAttribute('action')
        ev.tool = tool
        this.dispatchEvent(ev)
    }

    config(style) {
        if (!style) return
        if (style.bg) this.toolbar.style.setProperty('--bg',style.bg)
        if (style.fg) this.toolbar.style.setProperty('--fg',style.fg)
        if (style.justify) this.toolbar.style.setProperty('--justify', style.justify)
        if (style.th) this.toolbar.style.setProperty('--th', style.th)
    }

    showToolsAt(...indexes) {
        let tools = this.toolset.querySelectorAll('tool')
        indexes.forEach(i=>{
            let t = tools[i-1]
            if (t) t.style.display = 'inline-flex'
        })
    }
    hideToolsAt(...indexes) {
        let tools = this.toolset.querySelectorAll('tool')
        indexes.forEach(i=>{
            let t = tools[i-1]
            if (t) {
                if (t.toolbar) t.toolbar.hide()
                t.style.display = 'none'
            }
        })
    }
    createTool(td) {
        td = `<tool ${td}></tool>`
        let tempdiv = document.createElement('div')
        tempdiv.innerHTML = td
        let t = tempdiv.children[0]
        this._configureTool(t)
        t.parentToolbar = this
        t.status = t.parentToolbar.status = 'close'
        t.classList.toggle('open',false)
        t.parentToolbar.toolbar.classList.toggle('open',false)
        return t
    }
    createToolAt(td,index) {
        let tool = this.createTool(td)
        this.addToolAt(tool,index)
        return tool
    }
    addToolAt(t,index) {
        let p = this.toolset.querySelectorAll('tool')[index-1]
        if (p) this.toolset.insertBefore(t,p)
        else this.toolset.appendChild(t)
    }
    removeToolAt(index) {
        let t = this.toolset.querySelectorAll('tool')[index-1]
        if (t) this.toolset.removeChild(t)
        return t
    }
    createLineBefore(index) {
        let ch = this.toolset.children
        let nt = 0
        for (let i=0; i<ch.length; i++) {
            let t = ch[i]
            if (t.tagName == 'TOOL') nt++
            if (nt==index) {
                let l = document.createElement('line')
                this.toolset.insertBefore(l,t)
            }
        }
    }
    removeLineBefore(index) {
        let ch = this.toolset.children
        let nt = 0
        for (let i=0; i<ch.length; i++) {
            let t = ch[i]
            if (t.tagName == 'TOOL') nt++
            if (nt==index) {
                let l = ch[i-1]
                if (l.tagName == 'LINE') this.toolset.removeChild(l)
                return l
            }
        }
    }
    enableToolAt(index) {
        let tools = this.toolset.querySelectorAll('tool')
        if (tools[index-1]) tools[index-1].classList.toggle('disabled',false)
    }
    disableToolAt(index) {
        let tools = this.toolset.querySelectorAll('tool')
        if (tools[index-1]) tools[index-1].classList.toggle('disabled',true)
    }
    clickToolAt(index) {
        let tools = this.toolset.querySelectorAll('tool')
        if (tools[index-1]) this._onAction(tools[index-1])
    }
}

try { customElements.define('pc-toolbar', PiCoToolbar) } catch {}


