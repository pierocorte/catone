import { PiCoComponent } from "./pc_component.mjs"

export class PiCoOverlay extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                display: flex;
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            .lay {
                box-sizing: border-box;
                display: none;
                position: absolute;
                width: 100%;
                height: 100%;
                background-color: hsla(0, 50%, 40%, .6);
            }
            panel {
                box-sizing: border-box;
                display: flex;
                width: 100%;
                flex: 1;
                overflow: hidden;
            }
            left panel, right panel {
                flex-direction: column;
            }
            top panel {
                align-items: end;
                box-shadow: 0px 1px 2px 1px hsla(0,80%,20%,.4);
            }
            bottom panel {
                box-shadow: 0px -1px 2px 1px hsla(0,80%,20%,.4);
            }
            left panel {
                align-items: end;
                box-shadow: 1px 0 2px 1px hsla(0,80%,20%,.4);
            }
            right panel {
                box-shadow: -1px 0 2px 1px hsla(0,80%,20%,.4);
            }         
            .handle {
                display: block;
                position: absolute;
                width: 2em;
                height: 2em;
                border-radius: 1em;
                background-color: hsla(0,0%,50%,.5);
            }
            tophandle {
                left: 50%;
                top: 100%;
                transform: translateX(-50%) translateY(-50%);
                box-shadow: 0px 1px 2px 1px rgba(0,0,0,.4);
            }
            bottomhandle {
                left: 50%;
                top: 0;
                transform: translateX(-50%) translateY(-50%);
                box-shadow: 0px -1px 2px 1px rgba(0,0,0,.4);
            }
            lefthandle {
                left: 100%;
                top: 50%;
                transform: translateX(-50%) translateY(-50%);
                box-shadow: 1px 0 2px 1px rgba(0,0,0,.4);
            }
            righthandle {
                left: 0%;
                top: 50%;
                transform: translateX(-50%) translateY(-50%);
                box-shadow: -1px 0 2px 1px rgba(0,0,0,.4);
            }
        `
    }
    htm() {
        return `
            <panel><slot name="content"></slot></panel>
            <top class="lay">
                <panel><slot name="top"></slot></panel>
                <tophandle class="handle"></tophandle>
            </top>
            <bottom class="lay">
                <panel><slot name="bottom"></slot></panel>
                <bottomhandle class="handle"></bottomhandle>
            </bottom>
            <left class="lay">
                <panel><slot name="left"></slot></panel>
                <lefthandle class="handle"></lefthandle>
            </left>
            <right class="lay">
                <panel><slot name="right"></slot></panel>
                <righthandle class="handle"></righthandle>
            </right>
        `
    }

    onCreation() {
        const root = this.shadowRoot

        this.top = root.querySelector('top')
        this.tophandle = this.top.querySelector('tophandle')
        this.top.style.top = '-100%'
        this.top.pos = '0%'

        this.bottom = root.querySelector('bottom')
        this.bottomhandle = this.bottom.querySelector('bottomhandle')
        this.bottom.style.top = '100%'
        this.bottom.pos = '0%'

        this.left = root.querySelector('left')
        this.lefthandle = this.left.querySelector('lefthandle')
        this.left.style.top = '0%'
        this.left.style.left = '-100%'
        this.left.pos = '0%'

        this.right = root.querySelector('right')
        this.righthandle = this.right.querySelector('righthandle')
        this.right.style.top = '0%'
        this.right.style.left = '100%'
        this.right.pos = '0%'

        let moving = false
        const self = this
        let bb = null
        function down(e) {
            const t = e.target
            t.setPointerCapture(e.pointerId);
            t.addEventListener('pointermove', move)
            t.addEventListener('pointerup', up)
            const lay = t.parentNode
            self.top.style.transition = 'unset'
            self.bottom.style.transition = 'unset'
            self.left.style.transition = 'unset'
            self.right.style.transition = 'unset'
            self.top.style.zIndex = 0
            self.bottom.style.zIndex = 0
            self.left.style.zIndex = 0
            self.right.style.zIndex = 0
            lay.style.zIndex = 3
            bb = self.getBoundingClientRect()
        }
        function move(e) {
            moving = true
            const space = 4
            const t = e.target
            const lay = t.parentNode
            const x = e.clientX - bb.x
            const y = e.clientY - bb.y
            const cs = getComputedStyle(lay)
            const H = parseFloat(cs.height)
            const W = parseFloat(cs.width)
            switch (lay.tagName) {
                case 'TOP': {
                    lay.style.top = `calc(-100% + ${y}px)`
                    let pos = parseFloat(cs.top)
                    if (pos >= 0) pos = 0
                    if (-pos >= H) pos = -H

                    let bottompos = self.bottom.style.top == '100%' ? W : parseFloat(self.bottom.style.top)
                    bottompos -= H + 1 + space
                    if (pos >= bottompos) pos = bottompos

                    lay.pos = pos + 'px'
                    lay.style.top = pos == -H ? '-100%' : pos + 'px'
                    if (pos == -H) lay.pos = '0%'
                    break
                }
                case 'BOTTOM': {
                    lay.style.top = `calc(0% + ${y}px)`
                    let pos = parseFloat(cs.top)
                    if (pos <= 0) pos = 0
                    if (pos >= H) pos = H

                    let toppos = self.top.style.top == '-100%' ? -W : parseFloat(self.top.style.top)
                    toppos += H + 1 + space
                    if (pos <= toppos) pos = toppos

                    lay.pos = pos + 'px'
                    lay.style.top = pos == H ? '100%' : pos + 'px'
                    if (pos == H) lay.pos = '0%'
                    break
                }
                case 'LEFT': {
                    lay.style.left = `calc(-100% + ${x}px)`
                    let pos = parseFloat(cs.left)
                    if (pos >= 0) pos = 0
                    if (-pos >= W) pos = -W

                    let rightpos = self.right.style.left == '100%' ? W : parseFloat(self.right.style.left)
                    rightpos -= W + 1 + space
                    if (pos >= rightpos) pos = rightpos

                    lay.pos = pos + 'px'
                    lay.style.left = pos == -W ? '-100%' : pos + 'px'
                    if (pos == -W) lay.pos = '0%'
                    break
                }
                case 'RIGHT': {
                    lay.style.left = `calc(0% + ${x}px)`
                    let pos = parseFloat(cs.left)
                    if (pos <= 0) pos = 0
                    if (pos >= W) pos = W

                    let leftpos = self.left.style.left == '-100%' ? -W : parseFloat(self.left.style.left)
                    leftpos += W + 1 + space
                    if (pos <= leftpos) pos = leftpos

                    lay.pos = pos + 'px'
                    lay.style.left = pos == W ? '100%' : pos + 'px'
                    if (pos == W) lay.pos = '0%'
                    break
                }
            }
            syncLR()
        }
        function up(e) {
            const t = e.target
            const lay = t.parentNode
            t.removeEventListener('pointermove', move)
            t.removeEventListener('pointerup', up)
            const cs = getComputedStyle(self)
            const H = parseFloat(cs.height)
            const W = parseFloat(cs.width)
            if (!moving) {
                self.top.style.transition = 'top .5s'
                self.bottom.style.transition = 'top .5s'
                self.left.style.transition = 'top .5s, left .5s, height .5s'
                self.right.style.transition = 'top .5s, left .5s, height .5s'
                switch (lay.tagName) {
                    case 'TOP': {
                        if (lay.style.top != '-100%') lay.style.top = '-100%'
                        else {
                            let bottompos = self.bottom.style.top == '100%' ? W : parseFloat(self.bottom.style.top)
                            bottompos -= H + 1
                            let np = parseFloat(lay.pos)
                            if (np >= bottompos) np = bottompos
                            lay.style.top = np + 'px'
                        }
                        break
                    }
                    case 'BOTTOM': {
                        if (lay.style.top != '100%') lay.style.top = '100%'
                        else {
                            let toppos = self.top.style.top == '-100%' ? -W : parseFloat(self.top.style.top)
                            toppos += H + 1
                            let np = parseFloat(lay.pos)
                            if (np <= toppos) np = toppos
                            lay.style.top = np + 'px'
                        }
                        break
                    }
                    case 'LEFT': {
                        if (lay.style.left != '-100%') lay.style.left = '-100%'
                        else {
                            let rightpos = self.right.style.left == '100%' ? W : parseFloat(self.right.style.left)
                            rightpos -= W + 1
                            let np = parseFloat(lay.pos)
                            if (np >= rightpos) np = rightpos
                            lay.style.left = np + 'px'
                        }
                        break
                    }
                    case 'RIGHT': {
                        if (lay.style.left != '100%') lay.style.left = '100%'
                        else {
                            let leftpos = self.left.style.left == '-100%' ? -W : parseFloat(self.left.style.left)
                            leftpos += W + 1
                            let np = parseFloat(lay.pos)
                            if (np <= leftpos) np = leftpos
                            lay.style.left = np + 'px'
                        }
                        break
                    }
                }
            }
            moving = false
            syncLR()
        }
        function syncLR() {
            const space = 3
            const cs = getComputedStyle(self)
            const H = parseFloat(cs.height)
            const W = parseFloat(cs.width)
            let topY = parseFloat(self.top.style.top)
            if (self.top.style.top == '-100%') topY = -H
            topY = H + topY + space
            let bottomY = parseFloat(self.bottom.style.top)
            if (self.bottom.style.top == '100%') bottomY = H
            let nh = bottomY - topY - 1 - space >= 0 ? bottomY - topY - 1 - space : 0
            self.left.style.top = (topY) + 'px'
            self.left.style.height = nh + 'px'
            self.right.style.top = (topY) + 'px'
            self.right.style.height = nh + 'px'
        }

        this.tophandle.addEventListener('pointerdown', down)
        this.bottomhandle.addEventListener('pointerdown', down)
        this.lefthandle.addEventListener('pointerdown', down)
        this.righthandle.addEventListener('pointerdown', down)

    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'sides',]
    }
    _set_sides(v) {
        if (v.indexOf('t') != -1) this.top.style.display = 'flex'
        if (v.indexOf('b') != -1) this.bottom.style.display = 'flex'
        if (v.indexOf('l') != -1) this.left.style.display = 'flex'
        if (v.indexOf('r') != -1) this.right.style.display = 'flex'
    }

    reset() {
        setTimeout(() => {
            this.top.style.top = '-100%'
            this.top.pos = '0%'
            this.bottom.style.top = '100%'
            this.bottom.pos = '0%'
            this.left.style.top = '0%'
            this.left.style.left = '-100%'
            this.left.style.height = '100%'
            this.left.pos = '0%'
            this.right.style.top = '0%'
            this.right.style.left = '100%'
            this.right.style.height = '100%'
            this.right.pos = '0%'
        }, 0)
    }

}


try { customElements.define('pc-overlay', PiCoOverlay) } catch { }