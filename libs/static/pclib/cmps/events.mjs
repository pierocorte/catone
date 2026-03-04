/*
 *  Project name: PICO
 *  Author: PIERO CORTE
 *  File name: events.js
 *  Description: Mouse/Touch -Events Dispatcher (window)
 */

import {PICO} from "./glob.mjs"

export let evm = {
    target: null,   // event target
    keyTarget: null,// key-event target
    moving: false,  // moving state
    sp: null,       // start point (down point)
    ep: null,       // end point (move/up point)
}
evm.reset = function() {
    evm.target = null
    evm.moving = false
    evm.sp = null
    evm.ep = null
}
evm.down = function(e) {
    let t = evm.target = evm.target?evm.target:e.target
    PICO.closePopups(t)
    window.addEventListener('pointermove', evm.move)
    evm.sp = {x:e.pageX,y:e.pageY}
    evm.ep = {x:e.pageX,y:e.pageY}
    if (t.down) t.down({x:evm.sp.x, y:evm.sp.y},e)
}
evm.move = function(e) {
    evm.moving = true
    let t = evm.target
    let dx = e.pageX-evm.ep.x
    let dy = e.pageY-evm.ep.y
    evm.ep.x = e.pageX
    evm.ep.y = e.pageY
    if (t.move) t.move({x:evm.sp.x, y:evm.sp.y}, {x:evm.ep.x, y:evm.ep.y}, {x:dx, y:dy}, e)
}
evm.up = function(e) {
    let t = evm.target
    if (!t) return
    evm.ep.x = e.pageX
    evm.ep.y = e.pageY
    if (t.up) t.up({x:evm.sp.x, y:evm.sp.y}, {x:evm.ep.x, y:evm.ep.y}, e)
    evm.cancel(e)
}
evm.cancel = function(e) {
    window.removeEventListener('pointermove', evm.move)
    evm.reset()
}
evm.keydown = function(e) {
    let t = evm.keyTarget
    if (t && t.keydown) t.keydown(e)
}

window.addEventListener('pointerdown', evm.down)
window.addEventListener('pointerup', evm.up)
window.addEventListener('pointercancel', evm.cancel)
window.addEventListener('keydown', evm.keydown)
window.addEventListener('contextmenu',e=>e.preventDefault())

