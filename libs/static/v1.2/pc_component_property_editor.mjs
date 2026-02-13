import { PICO } from "./glob.mjs"
import { PiCoComponent } from "./pc_component.mjs"

class PiCoComponentPropertyEditor extends PiCoComponent {
    css() {
        return `
            :host {
                display: grid;
                grid-template-columns: auto;
                border: 1px solid hsl(0 0 50);
                padding: .5em;
            }
            details > div {
                display: flex;
                flex-direction: column;
                padding-bottom: .75em;
            }
            pc-field {
                width: 100%;
            }
            pc-field::part(label) {
                flex: 0;
            }
        `
    }

    htm() {
        return `
            <details>
                <summary>Placement</summary>
                <div>
                    <pc-field text="position" fire-on-blur></pc-field>
                    <pc-field text="left" fire-on-blur></pc-field>
                    <pc-field text="top" fire-on-blur></pc-field>
                </div>
            </details>
            <details>
                <summary>Size</summary>
                <div>
                    <pc-field text="width" fire-on-blur></pc-field>
                    <pc-field text="height" fire-on-blur></pc-field>
                </div>
            </details>
            <details>
                <summary>Padding</summary>
                <div>
                    <pc-field text="padding-top" fire-on-blur></pc-field>
                    <pc-field text="padding-right" fire-on-blur></pc-field>
                    <pc-field text="padding-bottom" fire-on-blur></pc-field>
                    <pc-field text="padding-left" fire-on-blur></pc-field>
                </div>
            </details>
            <details>
                <summary>Border</summary>
                <div>
                    <pc-field text="border-top" fire-on-blur></pc-field>
                    <pc-field text="border-right" fire-on-blur></pc-field>
                    <pc-field text="border-bottom" fire-on-blur></pc-field>
                    <pc-field text="border-left" fire-on-blur></pc-field>
                </div>
            </details>

            <pc-field text="fontSize"></pc-field>
            <pc-field text="margin"></pc-field>
            <pc-field text="backgroundColor"></pc-field>
            <pc-field text="color"></pc-field>
            <pc-field text="gap"></pc-field>
            <pc-field text="text"></pc-field>
            `
    }

    onCreation() {
        let fields = this.shadowRoot.querySelectorAll('pc-field')
        this.fields = Array.from(fields)
        this.fields.forEach(f=>f.addEventListener('change', this.change.bind(this)))
        this.target = null
    }

    setTarget(target) {
        this.target = target
        if (target == null) {this.clearAll(); return}
        this.fields[0].value = target.style.position
        this.fields[1].value = target.style.left
        this.fields[2].value = target.style.top
        this.fields[3].value = target.style.width
        this.fields[4].value = target.style.height
        this.fields[5].value = target.style.paddingTop.left
        this.fields[6].value = target.style.paddingRight.top
        this.fields[7].value = target.style.paddingBottom.width
        this.fields[8].value = target.style.paddingLeft.height
        this.fields[9].value =  target.style.borderTop.left
        this.fields[10].value = target.style.borderRight.top
        this.fields[11].value = target.style.borderBottom.width
        this.fields[12].value = target.style.borderLeft.height
    }

    clearAll() {
        this.fields.forEach(f=>f.value = '')
    }

    change(e) {
        this.target = PICO.lastSelected
        let p = e.target.getAttribute('text')
        if (!this.target) return
        if (p=='text') this.target.setAttribute('text', e.value)
        else this.target.style[p] = e.value
        // if (p=='padding') this.target._forcedPadding = false
    }

}
try { customElements.define('pc-component-property-editor', PiCoComponentPropertyEditor) } catch {}
