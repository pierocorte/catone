import { PICO } from "./glob.mjs"
import { PiCoComponent } from "./pc_component.mjs"

class PiCoGridPropertyEditor extends PiCoComponent {
    css() {
        return `
            :host {
                display: inline-block;
            }
            #grid-layout-props {
                display: grid;
                width: fit-content;
                grid-template-columns: repeat(6, 2.1em);
                grid-template-rows: unset;
                border: 1px solid hsl(0 0 50);
                padding: .5em;
                pc-icon {
                    border: .05em solid hsl(0 0 75);
                    height: 1.5em;
                    padding: 0;
                    font-size: 1.4em;
                }
            }
            pc-label:nth-child(odd) {
                color: hsl(210 75 35);
            }
            pc-label:nth-child(even) {
                color: hsl(0 0 50);
            }
            pc-icon:hover {
                background-color: hsl(0 0 75);
            }
            pc-icon.selected {
                background-color: hsl(30 70 75);
            }
            #grid-layout-props > div:nth-of-type(1) {
                grid-area: 1/1/span 1/span 6;
            }
            #grid-layout-props > div:nth-of-type(2) {
                grid-area: 3/1/span 1/span 6;
            }
            #grid-layout-props > div:nth-of-type(3) {
                grid-area: 5/1/span 1/span 6;
            }
            #grid-layout-props > div:nth-of-type(4) {
                grid-area: 7/1/span 1/span 6;
            }
        `
    }
    htm() {
        return `
            <pc-grid-layout id="grid-layout-props">
                <div><pc-label>align-content:</pc-label> <pc-label id="align-content">unset</pc-label></div>
                <pc-icon pname="align-content" pval="center">align_center</pc-icon>
                <pc-icon pname="align-content" pval="space-between">align_space_between</pc-icon>
                <pc-icon pname="align-content" pval="space-around">align_space_around</pc-icon>
                <pc-icon pname="align-content" pval="space-evenly">align_space_even</pc-icon>
                <pc-icon pname="align-content" pval="stretch">align_stretch</pc-icon>
                <empty></empty>

                <div><pc-label>justify-content:</pc-label> <pc-label id="justify-content">unset</pc-label></div>
                <pc-icon pname="justify-content" pval="center">align_justify_center</pc-icon>
                <pc-icon pname="justify-content" pval="start">align_justify_flex_start</pc-icon>
                <pc-icon pname="justify-content" pval="end">align_justify_flex_end</pc-icon>
                <pc-icon pname="justify-content" pval="space-between">align_justify_space_between</pc-icon>
                <pc-icon pname="justify-content" pval="space-around">align_justify_space_around</pc-icon>
                <pc-icon pname="justify-content" pval="space-evenly">align_justify_space_even</pc-icon>

                <div><pc-label>align-items:</pc-label> <pc-label id="algin-items">unset</pc-label></div>
                <pc-icon pname="align-items" pval="center">align_vertical_center</pc-icon>
                <pc-icon pname="align-items" pval="start">align_vertical_top</pc-icon>
                <pc-icon pname="align-items" pval="end">align_vertical_bottom</pc-icon>
                <pc-icon pname="align-items" pval="stretch">align_items_stretch</pc-icon>
                <pc-icon pname="align-items" pval="baseline">text_format</pc-icon>
                <empty></empty>

                <div><pc-label>justify-items:</pc-label> <pc-label id="justify-items">normal</pc-label></div>
                <pc-icon pname="justify-items" pval="center" transform="scaleX(.5)">align_horizontal_centeralign_horizontal_center</pc-icon>
                <pc-icon pname="justify-items" pval="start" transform="scaleX(.5)">align_horizontal_leftalign_horizontal_left</pc-icon>
                <pc-icon pname="justify-items" pval="end" transform="scaleX(.5)">align_horizontal_rightalign_horizontal_right</pc-icon>
                <pc-icon pname="justify-items" pval="stretch">align_justify_stretch</pc-icon>
                <empty></empty>
                <empty></empty>
            </pc-grid-layout>
        `
    }

    onCreation() {
        this.layout = this.shadowRoot.querySelector('pc-grid-layout')
        this.labels = this.layout.querySelectorAll('pc-label')
        this.icons = this.layout.querySelectorAll('pc-icon')
        this.props = {
            'align-content':'unset',
            'justify-content':'unset',
            'align-items':'unset',
            'justify-items':'normal',
        }
        this.layout.addEventListener('click', e=>{
            if (e.target.tagName == 'PC-ICON') this.selected(e.target)
        })
    }

    selected(icon) {
        let pname = icon.getAttribute('pname')
        let pval = icon.getAttribute('pval')
        switch(pname) {
            case 'align-content': {
                if (this.currentAlignContent) this.currentAlignContent.classList.remove('selected')
                if (this.props[pname]==pval) {
                    this.currentAlignContent = null
                    this.props[pname] = 'unset'
                    this.labels[1].text = 'unset'
                    break
                }
                this.currentAlignContent = icon
                this.currentAlignContent.classList.add('selected')
                this.props[pname]=pval
                this.labels[1].text = pval
                break
            }
            case 'justify-content': {
                if (this.currentJustifyContent) this.currentJustifyContent.classList.remove('selected')
                if (this.props[pname]==pval) {
                    this.currentJustifyContent = null
                    this.props[pname] = 'unset'
                    this.labels[3].text = 'unset'
                    break
                }
                this.currentJustifyContent = icon
                this.currentJustifyContent.classList.add('selected')
                this.props[pname]=pval
                this.labels[3].text = pval
                break
            }
            case 'align-items': {
                if (this.currentAlignItems) this.currentAlignItems.classList.remove('selected')
                if (this.props[pname]==pval) {
                    this.currentAlignItems = null
                    this.props[pname] = 'unset'
                    this.labels[5].text = 'unset'
                    break
                }
                this.currentAlignItems = icon
                this.currentAlignItems.classList.add('selected')
                this.props[pname]=pval
                this.labels[5].text = pval
                break
            }
            case 'justify-items': {
                if (this.currentJustifyItems) this.currentJustifyItems.classList.remove('selected')
                if (this.props[pname]==pval) {
                    this.currentJustifyItems = null
                    this.props[pname] = 'normal'
                    this.labels[7].text = 'normal'
                    break
                }
                this.currentJustifyItems = icon
                this.currentJustifyItems.classList.add('selected')
                this.props[pname]=pval
                this.labels[7].text = pval
                break
            }
        }
        this.target = PICO.lastSelected
        if (this.target)
            for (let p in this.props) this.target.style[p] = this.props[p]
    }

    setTarget(target) {
        this.target = target
    }

}
try { customElements.define('pc-grid-property-editor', PiCoGridPropertyEditor) } catch {}
