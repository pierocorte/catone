import { PiCoComponent } from "http://localhost:3000/lib/v1.2/pc_component.mjs";
import "http://localhost:3000/lib/v1.2/pc_canvas.mjs";
import "http://localhost:3000/lib/v1.2/pc_label.mjs";

export default class Fe3020 extends PiCoComponent {
  css() {
    return `
            :host {
                display: block;
                padding: 1em;
                background-color: hsl(210 100 50);
                color: hsl(0 0 100);
                font-family: Arial, sans-serif;
            }
            
            p {
                margin: 0;
                padding: 0 .2em;
            }
            
        `;
  }

  htm() {
    return `
            <panel>no service found</panel>
        `;
  }
  onCreation() {
    fetch("http://localhost:3000/reg_csv/service")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        this.showServices(data);
      })
      .catch((error) => {
        console.error("Error fetching data from API:", error);
      });
  }

  showServices(data) {
    const container = this.shadowRoot.querySelector("panel");
    if (container) {
      console.log(data);
      container.innerHTML = data
        .map(
          (service) =>
            `<p>${service.name} → ${service.url} - status:${service.status} </p>`,
        )
        .join("");
    } else {
      container.innerHTML = `<p>service not found</p>`;
    }
  }
}

try {
  customElements.define("fe-3020", Fe3020);
} catch {}
