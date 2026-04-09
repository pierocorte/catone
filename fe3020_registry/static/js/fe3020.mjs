

const GATEWAY = "http://localhost:3000";
import(`${GATEWAY}/lib/pclib/cmps/pc_label.mjs`);
import(`${GATEWAY}/lib/pclib/cmps/pc_button.mjs`);
const res = await import(`${GATEWAY}/lib/pclib/cmps/pc_component.mjs`);
const PiCoComponent = res.PiCoComponent;


export default class Fe3020 extends PiCoComponent {
  css() {
    return `
            :host {
                display: block;
                padding: 1em;
                color: hsl(0 0 100);
                font-family: Arial, sans-serif;
                box-sizing: border-box;
            }
            container{
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            service{
              display: flex;
              flex-direction : row;
              gap :10px;
            }
            p {
                margin: 0;
                padding: 0 .2em;
            }
            
        `;
  }

  htm() {
    return `
          <container>
            <service>
              <p>fake-service</p>
              <pc-button text="ping me"></pc-button>
              <pc-label text=""></pc-label>
            </service>
          </container>
        `;
  }
  onCreation() {
    this.container = this.shadowRoot.querySelector("container");
    this.service = this.shadowRoot.querySelector("service");
    this.loadServices();
    this.service.remove();

    this.interval = setInterval(() => {
      this.loadServices();
    }, 3000);
  }

  renderServices(services) {
    this.container.innerHTML = "";
    if (services.length === 0) {
      this.container.innerHTML = `<p>no service found</p>`;
      return;
    }

    services.forEach((s) => {
      const clone = this.service.cloneNode(true);
      const p = clone.querySelector("p");
      const btn = clone.querySelector("pc-button");
      const lbl = clone.querySelector("pc-label");


      p.textContent = s.name;
      console.log(s)
      if (s.status !== "on") btn.setAttribute("disabled", "");
      else btn.removeAttribute("disabled");

      btn.addEventListener("click", () => {
        this.ping(s.name).then((res) => lbl.setAttribute("text", res.status));
      });
      this.container.appendChild(clone);
    });
  }
  //inserisci le variabili d'ambiente
  async ping(serviceName) {
    const res = fetch(`http://localhost:3000/svc/${serviceName}/ping`);
    return (await res).json();
  }

  loadServices() {
    fetch("http://localhost:3000/reg/service")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        this.renderServices(data);
      })
      .catch((error) => {
        console.error("Error fetching data from API:", error);
      });
  }
}

try {
  customElements.define("fe-3020", Fe3020);
} catch { }
