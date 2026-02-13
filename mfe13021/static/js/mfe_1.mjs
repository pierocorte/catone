import { PiCoComponent } from 'http://localhost:3000/lib/v1.2/pc_component.mjs';
import 'http://localhost:3000/lib/v1.2/pc_canvas.mjs';
import './mc_label.mjs';

export default class Mfe1 extends PiCoComponent {
    css() {
        return `
            :host {
                display: block;
                padding: 1em;
                background-color: hsl(210 100 50);
                color: hsl(0 0 100);
                font-family: Arial, sans-serif;
            }
            panel {
                display: flex;
                flex-direction: column;
                gap: 0.1em;
            }   
            p {
                margin: 0;
                padding: 0 .2em;
                background-color: hsl(0 0 100/.2);
                cursor: pointer;
            }
            p:hover {
                background-color: hsl(0 0 100/.4);
            }
        `;
    }

    htm() {
        return `
            <panel>This is an µfe1 component.</panel>
            <mc-label></mc-label>
            <pc-canvas></pc-canvas>
        `;
    }
    onCreation() {
        this.panel = this.shadowRoot.querySelector('panel');
        this.panel.addEventListener('click', (e) => {
            if (e.target.tagName !== 'P') return;
            console.log('Panel clicked', e.target.innerHTML);
            let ev = new CustomEvent('mfe1-click')
            ev.value = e.target.innerHTML
            this.dispatchEvent(ev)
        })

        fetch('http://localhost:3000/api/localhost:3011/api/persons')
            .then(response => response.json())
            .then(data => {
                console.log('Data fetched from API:', data);
                this.showPersons(data);
            })
            .catch(error => {
                console.error('Error fetching data from API:', error);
            });
    }

    showPersons(persons) {
        const container = this.shadowRoot.querySelector('panel');
        if (container) {
            container.innerHTML = persons.map(person => `<p>${person.name}</p>`).join('');
        } else {
            console.error('Container not found in shadow DOM');
        }
    }
}

try { customElements.define('mfe-1', Mfe1) } catch { }