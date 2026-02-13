import {PiCoComponent} from './pc_component.mjs'

export class PiCoImage extends PiCoComponent {
    css() {
        return `
            :host {
                box-sizing: border-box;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                
                vertical-align: middle;
                line-height: 1.5em;
                width: 1.5em;
                height: 1.5em;

                -webkit-user-select: none; /* Safari/iOS */
                -ms-user-select: none;     /* IE/Edge */
                user-select: none;

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
        this.img = this.shadowRoot.querySelector('img')
        this.src = this.innerHTML
    }

    static get observedAttributes() { 
        return [...PiCoComponent.observedAttributes, 'src','width','height']
    }

    get src() { return this.img.getAttribute('src')}
    set src(v) { this.img.setAttribute('src',v)}

    get width() { return this.img.style.width }
    set width(v) { this.img.style.width = v }

    get height() { return this.img.style.height }
    set height(v) { this.img.style.height = v }
}

try { customElements.define('pc-image', PiCoImage) } catch {}