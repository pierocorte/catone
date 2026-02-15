import { PiCoComponent } from './pc_component.mjs'

export class PiCoImage extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                
                --width: calc(1.5em + 1px);
                height: calc(1.5em + 1px);
                
                object-fit: contain;
                overflow: hidden;
            }
            img {
                object-fit: inherit;
                width: inherit;
                height: inherit;
            }
        `
    }
    htm() {
        return `
            <img part="img"></img>
        `
    }
    onCreation() {
        const root = this.shadowRoot
        this.img = root.querySelector('img')
        this.src = this.innerHTML
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'src', 'width', 'height']
    }
    _set_src(v) { this.img.setAttribute('src', v) }
    _set_width(v) { this.img.style.width = v }
    _set_height(v) { this.img.style.height = v }
}

try { customElements.define('pc-image', PiCoImage) } catch { }