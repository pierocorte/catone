import { PICO } from "./glob.mjs"
import { PiCoComponent } from "./pc_component.mjs"

class PiCoFlexPropertyEditor extends PiCoComponent {
    css() {
        return `
            :host {
                display: inline-block;
            }
            #flex-layout-props {
                display: grid;
                width: 100%;
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
                color: hsl(210 70 30);
                font-size: .8em;
            }
            pc-label:nth-child(even) {
                color: hsl(0 0 50);
                font-size: .8em;
            }
            pc-icon:hover {
                background-color: hsl(0 0 75);
            }
            pc-icon.selected {
                background-color: hsl(30 70 75);
            }
            #flex-layout-props > div:nth-of-type(1) {
                grid-area: 1/1/span 1/span 6;
            }
            #flex-layout-props > div:nth-of-type(2) {
                grid-area: 3/1/span 1/span 6;
            }
            #flex-layout-props > div:nth-of-type(3) {
                grid-area: 5/1/span 1/span 6;
            }
            #flex-layout-props > div:nth-of-type(4) {
                grid-area: 7/1/span 1/span 6;
            }
            #flex-layout-props > div:nth-of-type(5) {
                grid-area: 9/1/span 1/span 6;
            }
        `
    }
    htm() {
        return `
            <pc-grid-layout id="flex-layout-props">
                <div><pc-label>flex-direction:</pc-label> <pc-label id="flex-direction">row</pc-label></div>
                <pc-icon pname="flex-direction" pval="row" style="transform:rotateY(180deg) rotateZ(90deg)">flex_direction</pc-icon>
                <pc-icon pname="flex-direction" pval="column">flex_direction</pc-icon>
                <pc-icon pname="flex-direction" pval="row-reverse" style="transform:rotateZ(90deg)">flex_direction</pc-icon>
                <pc-icon pname="flex-direction" pval="column-reverse" style="transform:rotateX(180deg)">flex_direction</pc-icon>
                <empty></empty>
                <empty></empty>

                <div><pc-label>flex-wrap:</pc-label> <pc-label id="flex-wrap">nowrap</pc-label></div>
                <pc-icon pname="flex-wrap" pval="nowrap">flex_no_wrap</pc-icon>
                <pc-icon pname="flex-wrap" pval="wrap">flex_wrap</pc-icon>
                <empty></empty>
                <empty></empty>
                <empty></empty>
                <empty></empty>

                <div><pc-label>align-content:</pc-label> <pc-label id="align-content">unset</pc-label></div>
                <pc-icon pname="align-content" pval="center">align_center</pc-icon>
                <pc-icon pname="align-content" pval="flex-start" style="transform:rotateZ(90deg)">align_justify_flex_start</pc-icon>
                <pc-icon pname="align-content" pval="flex-end" style="transform:rotateZ(90deg)">align_justify_flex_end</pc-icon>
                <pc-icon pname="align-content" pval="space-around" style="transform:rotateZ(90deg)">align_justify_space_around</pc-icon>
                <pc-icon pname="align-content" pval="space-between" style="transform:rotateZ(90deg)">align_justify_space_between</pc-icon>
                <pc-icon pname="align-content" pval="stretch">align_stretch</pc-icon>

                <div><pc-label>justify-content:</pc-label> <pc-label id="justify-content">unset</pc-label></div>
                <pc-icon pname="justify-content" pval="center">align_justify_center</pc-icon>
                <pc-icon pname="justify-content" pval="flex-start">align_justify_flex_start</pc-icon>
                <pc-icon pname="justify-content" pval="flex-end">align_justify_flex_end</pc-icon>
                <pc-icon pname="justify-content" pval="space-between">align_justify_space_between</pc-icon>
                <pc-icon pname="justify-content" pval="space-around">align_justify_space_around</pc-icon>
                <pc-icon pname="justify-content" pval="space-evenly">align_justify_space_even</pc-icon>

                <div><pc-label>align-items:</pc-label> <pc-label id="align-items">normal</pc-label></div>
                <pc-icon pname="align-items" pval="center">align_vertical_center</pc-icon>
                <pc-icon pname="align-items" pval="flex-start">align_vertical_top</pc-icon>
                <pc-icon pname="align-items" pval="flex-end">align_vertical_bottom</pc-icon>
                <pc-icon pname="align-items" pval="stretch">align_items_stretch</pc-icon>
                <pc-icon pname="align-items" pval="baseline">text_format</pc-icon>
                <empty></empty>

            </pc-grid-layout>

        `
    }

    onCreation() {
        this.layout = this.shadowRoot.querySelector('pc-grid-layout')
        this.labels = this.layout.querySelectorAll('pc-label')
        this.icons = this.layout.querySelectorAll('pc-icon')
        this.props = {
            'flex-direction':'row',
            'flex-wrap':'nowrap',
            'align-content':'unset',
            'justify-content':'unset',
            'align-items':'normal'
        }
        this.selected(this.icons[0]) /* flex-direction: row */
        this.selected(this.icons[4]) /* flex-wrap: nowrap */
        this.layout.addEventListener('click', e=>{
            if (e.target.tagName == 'PC-ICON') this.selected(e.target)
        })
    }

    selected(icon) {
        let pname = icon.getAttribute('pname')
        let pval = icon.getAttribute('pval')
        switch(pname) {
            case 'flex-direction': {
                if (this.currentDirection) this.currentDirection.classList.remove('selected')
                if (this.props[pname]==pval) {
                    this.props[pname]=''
                    this.selected(this.icons[0])
                    return
                }
                this.currentDirection = icon
                this.currentDirection.classList.add('selected')
                this.props[pname]=pval
                this._changeDirection(pval)
                this.labels[1].text = pval
                break
            }
            case 'flex-wrap': {
                if (this.currentWrap) this.currentWrap.classList.remove('selected')
                if (this.props[pname]==pval) {
                    this.props[pname]=''
                    this.selected(this.icons[4])
                    return
                }
                this.currentWrap = icon
                this.currentWrap.classList.add('selected')
                this.props[pname]=pval
                this.labels[3].text = pval
                break
            }
            case 'align-content': {
                if (this.currentAlignContent) this.currentAlignContent.classList.remove('selected')
                if (this.props[pname]==pval) {
                    this.currentAlignContent = null
                    this.props[pname] = 'unset'
                    this.labels[5].text = 'unset'
                    break
                }
                this.currentAlignContent = icon
                this.currentAlignContent.classList.add('selected')
                this.props[pname]=pval
                this.labels[5].text = pval
                break
            }
            case 'justify-content': {
                if (this.currentJustifyContent) this.currentJustifyContent.classList.remove('selected')
                if (this.props[pname]==pval) {
                    this.currentJustifyContent = null
                    this.props[pname] = 'unset'
                    this.labels[7].text = 'unset'
                    break
                }
                this.currentJustifyContent = icon
                this.currentJustifyContent.classList.add('selected')
                this.props[pname]=pval
                this.labels[7].text = pval
                break
            }
            case 'align-items': {
                if (this.currentAlignItems) this.currentAlignItems.classList.remove('selected')
                if (this.props[pname]==pval) {
                    this.currentAlignItems = null
                    this.props[pname] = 'normal'
                    this.labels[9].text = 'normal'
                    break
                }
                this.currentAlignItems = icon
                this.currentAlignItems.classList.add('selected')
                this.props[pname]=pval
                this.labels[9].text = pval
                break
            }
        }

        this.target = PICO.lastSelected
        if (this.target)
            for (let p in this.props) this.target.style[p] = this.props[p]
    }

    _changeDirection(newdir) {
        if (this.props.direction == newdir) return
        switch (newdir) {
            case 'row': {
                this.icons[13].setAttribute('transform', '')
                this.icons[14].setAttribute('transform', '')
                for (let i=6; i<=17; i++) this.icons[i].setAttribute('transform', '')    
                break
            }
            case 'column': {
                this.icons[13].setAttribute('transform', '')
                this.icons[14].setAttribute('transform', '')
                for (let i=6; i<=11; i++) this.icons[i].setAttribute('transform', 'rotateZ(-90deg)')
                for (let i=12; i<=17; i++) this.icons[i].setAttribute('transform', 'rotateZ(90deg)')    
                break
            }
            case 'row-reverse': {
                for (let i=6; i<=17; i++) this.icons[i].setAttribute('transform', '')
                this.icons[13].setAttribute('transform', 'rotateZ(180deg)')
                this.icons[14].setAttribute('transform', 'rotateZ(180deg)')    
                break
            }
            case 'column-reverse': {
                for (let i=6; i<=11; i++) this.icons[i].setAttribute('transform', 'rotateZ(-90deg)')
                for (let i=12; i<=17; i++) this.icons[i].setAttribute('transform', 'rotateZ(90deg)')
                this.icons[13].setAttribute('transform', 'rotateZ(-90deg)')
                this.icons[14].setAttribute('transform', 'rotateZ(-90deg)')    
                break
            }
        }
    }

    setTarget(target) {
        this.target = target
    }

}
try { customElements.define('pc-flex-property-editor', PiCoFlexPropertyEditor) } catch {}
