/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_component.mjs
 *  Description: Top Class of ths PiCo WebComponents Hierarchy
 */

import { PiCoComponent } from './pc_component.mjs'

export class PiCoMovable extends PiCoComponent {
    toggleMovement(on) {
        this.style.position = 'absolute'
        this._moveEnabled = on==undefined?!this._moveEnabled:on
        if (this._moveEnabled)
            this.move = (sp, ep, dp, e) => {
                this.moving = true
                let x = parseFloat(this.style.left)
                let y = parseFloat(this.style.top)
                if (isNaN(x)) {
                    let bb = this.getBoundingClientRect()
                    x = bb.x
                    y = bb.y
                } 
                this.style.left = x+dp.x+'px'
                this.style.top = y+dp.y+'px'
            }
        else {
            this.move = undefined
        }
    }
}


