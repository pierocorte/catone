/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_icon.mjs
 *  Description: Component to realize icons based on Google Font Symbols
 */

// import { PICO } from './glob.mjs'
import { PiCoComponent } from './pc_component.mjs'

export class PiCoTable extends PiCoComponent {
    css() {
        return super.css() + `
            :host {
                display: inline-table;
                border: 0px solid black;
                border-collapse: collapse;
                background-color: white;
                --textAlign: center;
            }
            :host(:focus) {
                outline: none;
            }
            thead {
                position: sticky;
                top: 0;
                z-index: 1;
                background-color: hsla(220, 26%, 91%, 1.00);
                color: black;
            }
            thead th {
                font-weight: 300;
            }
            tr, td, th {
                border: 0px solid black;
                padding: .5em;
                text-align: left;
            }
            tr:nth-child(even) {
                background-color: hsla(216, 31%, 94%, 1.00);
            }
            tr.selected {
                background-color: hsla(216, 60%, 60%, 1.00);
                color: white;
            }

            td, th {
                text-align: var(--textAlign);
            }

            td > colored {
                font-size: .8em;
                background-color: hsl(0,0%,50%);
                border-radius: 1em;
                padding: .3em .5em .2em;
                color: white
            }
            td > colored.on {
                background-color: hsl(120, 100%, 30%);
            }
            td > colored[si] {
                background-color: hsl(120, 100%, 30%);
            }
            td > colored[no] {
                background-color: hsl(0, 100%, 30%);
            }
        `
    }
    htm() {
        return `
                <thead>
                </thead>
                <tbody>
                </tbody>
        `
    }

    onCreation() {
        const root = this.shadowRoot
        this.thead = root.querySelector('thead')
        this.tbody = root.querySelector('tbody')
        this.tbody.addEventListener('click', e => {
            let td = e.target
            while (td && td.tagName !== 'TD') td = td.parentNode
            if (!td) return
            const row = td.parentNode
            this.unselect()
            if (row._data) {
                this.rowSelected = row
                this.rowSelected.classList.add('selected')
            }
            const rowIndex = row.__index
            const ne = new Event('row-selected')
            ne.rowIndex = rowIndex
            ne.innerTarget = e.target
            this.dispatchEvent(ne)
        })
    }

    static get observedAttributes() {
        return [...PiCoComponent.observedAttributes, 'size', 'header']
    }
    _set_size(v) {
        if (!v) return
        const [ncol, nrow] = v.split(',')
        for (let r = 0; r < nrow; r++) {
            const row = document.createElement('tr')
            row.__index = r
            this.tbody.appendChild(row)
            for (let c = 0; c < ncol; c++) {
                const cell = document.createElement('td')
                cell.innerHTML = '-'
                row.appendChild(cell)
            }
        }
    }
    _set_header(v) {
        if (!v) return
        const headval = v.split(',')
        const row = document.createElement('tr')
        this.thead.appendChild(row)
        headval.forEach(s => {
            const cell = document.createElement('th')
            cell.innerHTML = s.trim()
            row.appendChild(cell)
        })
    }

    setRows(list) {
        this.tbody.innerHTML = ''
        for (let r = 0; r < list.length; r++) {
            const row = document.createElement('tr')
            row.__index = r
            this.tbody.appendChild(row)
            for (let p in list[r]) {
                const cell = document.createElement('td')
                cell.innerHTML = list[r][p]
                row.appendChild(cell)
            }
        }
    }

    getTRs() {
        return this.tbody.querySelectorAll('tr')
    }

    unselect() {
        if (this.rowSelected) this.rowSelected.classList.remove('selected')
        this.rowSelected = null
    }

}

try { customElements.define('pc-table', PiCoTable) } catch { }