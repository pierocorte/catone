/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_label.mjs
 *  Description: Component to realize a label
 */

import { PiCoContainer } from "./pc_container.mjs";
import { PiCoButton } from "./pc_button.mjs";

export class PiCoTabPanel extends PiCoContainer {
  css() {
    return (
      super.css() + `
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          outline: none!important;
        }
        tabs {
          display: flex;
          justify-content: space-between;
          padding: .5em;
          border-top: 1px solid var(--bdc);
          border-bottom: 1px solid var(--bdc);
        }
        pc-button {
          flex-direction: column;
          color: black;
          background-color: transparent!important;
          font-size: 1.5em;
          line-height: 1em;
          padding: 0 .3em;
          min-width: 2em;
        }
        pc-button::part(text) {
          font-size: .5em;
        }
        pc-button.selected {
          background-color: hsl(0, 0%, 20%)!important;
          color: hsl(0, 0%, 100%);
          font-weight: 700;
          outline: none;
        }
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        @media (orientation: out-landscape) {
          :host {
              flex-direction: row;
          }
          tabs {
              flex-direction: column;
              padding: 0 .5em;
              border-right: 1px solid gray;
          }
        }
      `
    );
  }
  htm() {
    return `
      <tabs part="tabs">
        <pc-button icon="home"></pc-button>
        <pc-button icon="menu"></pc-button>
        <pc-button icon="settings"></pc-button>
      </tabs>
      <main>
        ${super.htm()}
      </main>
    `;
  }

  onCreation() {
    this.tabs = this.shadowRoot.querySelector("tabs");
    this.tabs.innerHTML = "";
    let first = true
    this.panels = Array.from(this.children)
    //this.innerHTML = ''  // It keeps all their children into the DOM to be querySelect-able.
    this.panels.forEach((p, ind) => {
      let nav = p.getAttribute("nav");
      let name = p.getAttribute("name");
      if (first) this.home = name
      first = false
      let selected = p.getAttribute("selected");
      if (selected != null) this.home = name;
      if (nav) {
        let parts = nav.split(",");
        let but = new PiCoButton();
        but.setAttribute("text", parts[0]);
        if (parts[1]) but.setAttribute("icon", parts[1]);
        this.tabs.appendChild(but);
        p.__navButton = but;
        but.addEventListener("click", (e) => this.showPanel(name));
      }
    });
    if (this.tabs.children.length == 0) this.hideTabs()
    if (this.home) this.showPanel(this.home)
  }

  showPanel(name) {
    if (this.selected) {
      this.selected.classList.remove("selected");
      this.selected = null;
    }
    const panel = this.panels.find(p => p.getAttribute('name') == name);
    this.replace(panel)
    const button = panel.__navButton
    if (button) (this.selected = button).classList.add("selected");
    const ne = new Event("selected");
    ne.value = name;
    this.dispatchEvent(ne);
    return panel
  }

  showTabs() {
    this.tabs.style.display = 'flex'
  }
  hideTabs() {
    this.tabs.style.display = 'none'
  }

}

try { customElements.define("pc-tab-panel", PiCoTabPanel) } catch { }
