import {PiCoComponent} from './pc_component.mjs'

export class PiCoThumbnail extends PiCoComponent {
    template() {
        return `
            <style>
                :host {
                    box-sizing: border-box;
                    display: inline-flex;
                    position: relative;
                    flex-flow: column;
                    line-height: 1.2em;
                    background-color: white;
                    width: 5em;
                    height: 5em;
                }
                content {
                    box-sizing: border-box;
                    display: grid;
                    width: 100%;
                    height: 100%;
                    place-content: center;
                    border: .05em solid hsl(0 0 50);
                    padding: .5em .2em;
                }
                text {
                    box-sizing: border-box;
                    pointer-events: none;
                    border: .05em solid hsl(0 0 50);
                    width: 100%;
                    border-top: none;
                    text-align: center;
                    font-size: .9em;
                    line-height: 1.2em;
                    padding: .25em;
                }
                cover {
                    position: absolute;
                    left: 0 ;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: transparent;
                }
            </style>
            <content><slot name="content"></slot></content>
            <text part="text">Text</text>
            <cover></cover>
        `
    }
    onCreation() {
        this.setAttribute('pca-draggable','')
        this._text = this.shadowRoot.querySelector('text')
        let c = this.children[0]
        if (!c) return
        c.setAttribute('slot','content')
        c.setAttribute('passive','')
        this.element = c
    }

    static get observedAttributes() { 
        return [...PiCoComponent.observedAttributes, 'text']
    }

    get text() {return this._text.innerHTML}
    set text(v) {this._text.innerHTML = v}

    getDragElement() {
        if (this.element) {
            let de = this.element.cloneNode(true)
            de.removeAttribute('focusable')
            de._thumbnailClone = true
            de.setAttribute('pca-draggable','')
            de.setAttribute('pca-drag-action','move|copy')
            return de
        } else return null
    }

    isDraggingCopyOnly() {
        return true
    }


}

try { customElements.define('pc-thumbnail', PiCoThumbnail) } catch {}