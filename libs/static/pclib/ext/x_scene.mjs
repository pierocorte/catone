import { PiCoContainer } from "../cmps/pc_container.mjs";
import { PiCoComponent } from "../cmps/pc_component.mjs";
import "../cmps/pc_check.mjs";

export class XScene extends PiCoContainer {
    css() {
        return super.css() + `
            :host {
                display: flex;
                flex-direction: column;
                height: 100%;
                width: 100%;
            }
            scene {
                flex: 1;
                display: block;
                perspective: 1000px;
                font-size: .6em;
                --space-border: 20px;
                --space-bdc: hsla(0,0%,20%,0);
            }

            content {
                display: flex;
                align-items: center;
                justify-content: center;
                --width: 100%;
                height: 100%;
                transform-style: preserve-3d;
                transform: rotateX(33deg) rotateZ(0deg);
                --animation: spin 36s infinite linear;
            }
            space {
                position: relative;
                display: block;
                width: 300px;
                height: 180px;
                border: var(--space-border) solid var(--space-bdc);
                background-color: hsla(0, 0%, 0%, .2);
                transform-style: preserve-3d;
            }
            
            control {
                width: fit-content
                height: fit-content;
                padding: .5em 1em;

            }

            @keyframes spin {
                from {
                    transform: rotateX(50deg) rotateZ(0deg);
                }
                to {
                    transform: rotateX(50deg) rotateZ(360deg);
                }
            }
        `
    }
    htm() {
        return `
            <scene>
                <content>
                    <space>
                        ${super.htm()}
                    </space>
                </content>
            </scene>
            <control><pc-check></pc-check> <label>unlocked</label></control>
        `
    }

    onCreation() {
        super.onCreation()
        const root = this.shadowRoot
        this.scene = root.querySelector('scene')
        this.content = root.querySelector('content')
        this.space = root.querySelector('space')
        this.controlCheck = root.querySelector('pc-check')

        this.addEventListener('pointerdown', e => {
            if (this._locked) return
            this.down = { x: e.clientX, y: e.clientY }
        })
        this.addEventListener('pointermove', e => {
            if (!this.down) return
            let dx = e.clientX - this.down.x
            let dy = e.clientY - this.down.y
            if (dx * dx + dy * dy < 81) return
            const xdeg = 360 - Math.floor(360 * e.clientX / this.clientWidth) - 180
            const ydeg = 180 - Math.floor(180 * e.clientY / this.clientHeight)
            this.content.style.transform = `rotateX(${ydeg}deg) rotateZ(${xdeg}deg)`
        })
        this.addEventListener('pointerup', e => this.down = null)

        this.controlCheck.addEventListener('click', e => {
            this._locked = e.target.value
            if (this._locked) {
                this.controlCheck.parentNode.children[1].innerHTML = 'locked'
            } else {
                this.controlCheck.parentNode.children[1].innerHTML = 'unlocked'
            }
        })
        this._locked = true
        this.controlCheck.value = this._locked
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'width', 'height', 'color', 'scale']
    }
    _set_width(v) {
        this.space.style.width = v + 'px'
    }
    _set_height(v) {
        this.space.style.height = v + 'px'
    }
    _set_color(v) {
        this.space.style.backgroundColor = v
    }
    _set_scale(v) {
        this.scene.style.transform = `scale(${v})`
    }
}

try { customElements.define('x-scene', XScene) } catch { }
