import {PICO} from './glob.mjs'

customElements.safeDefine = function(name, classe) {
    try {this.define(name,classe)} catch {}
}

let hiddens = document.createElement('pc-hidden')
hiddens.style.display = 'block'
hiddens.style.left = 0;
hiddens.style.top = 0;
hiddens.style.width = 0;
hiddens.style.height = 0;
document.body.appendChild(hiddens)

PICO.hiddens = hiddens
PICO.app = document.querySelector('pc-app')

PICO.popups = []
PICO.openPopup = function(name,x,y) {
    let popup = PICO.POPUPS[name]
    if (popup) {
        popup.show(x,y)
        let pbb = popup.getBoundingClientRect()
        x = x+pbb.width>window.innerWidth?window.innerWidth-pbb.width:x
        y = y+pbb.height>window.innerHeight?window.innerHeight-pbb.height:y
        popup.show(x,y)
        PICO.popups.push(popup)   
    }    
}
PICO.closePopups = function(target) {
    if (target.tagName == 'PC-POPUP') return
    PICO.popups.forEach(p=>{if (p!=target) p.close()})
}
