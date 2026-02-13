import {PiCoComponent} from './pc_component.mjs'

export class PiCoFullscreen extends PiCoComponent {
    template() {
        return `
            <style>
                :host {
                    box-sizing: border-box;
                    display: inline-grid;
                    place-content: center;
                    
                    position: fixed;
                    right: 1em;
                    bottom: 1em;
                    width: 1.2em;
                    height: 1.2em;
                    border: .05em solid hsl(0 0 0);
                    overflow: hidden;
                }
            </style>
            <pc-icon>fullscreen</pc-icon>
        `
    }

    onCreation() {
        this.addEventListener('click',this.toggleFS.bind(this))
    }

    static get observedAttributes() { 
        return [...PiCoComponent.observedAttributes, 'element']
    }

    get element() { return this._element }
    set element(v) { 
        this._element = document.querySelector(v)
    }

    openFullscreen() {
        let elem = this.element || document.body;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    }
    closeFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
    toggleFS() {
        let fs = document.fullscreenElement || document.webkitCurrentFullScreenElement
        if (!fs) this.openFullscreen()
        else this.closeFullscreen()
    }
}


try { customElements.define('pc-fullscreen', PiCoFullscreen) } catch {}