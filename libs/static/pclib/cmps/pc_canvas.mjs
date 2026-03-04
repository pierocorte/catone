/*
 *  Project name: PiCo WebComponents
 *  Author: PIERO CORTE
 *  File name: pc_canvas.mjs
 *  Description: Component to realize a draw-able, scal-able, translat-able,
 *  and rotat-able canvas with a canvas and html-div overlays
 */

import { PiCoComponent } from './pc_component.mjs'
import { evm } from './events.mjs'

class Rect {
    get fgColor() { return 'hsla(100,70%,50%,.9)'; }
    get p1() { return this._p1 || { x: -1000000, y: -1000000 }; }
    set p1(p) { this._p1 = p; }
    get p2() { return this._p2 || { x: -1000000, y: -1000000 }; }
    set p2(p) { this._p2 = p; }

    draw(ctx) {
        let rect = { x1: this.p1.x, y1: this.p1.y, x2: this.p2.x, y2: this.p2.y };


        let cx = (rect.x1+rect.x2)/2
        let cy = (rect.y1+rect.y2)/2

        this.prepareDraw(ctx,cx,cy)

        const path = new Path2D();
        path.rect(rect.x1, rect.y1, rect.x2 - rect.x1, rect.y2 - rect.y1);
        ctx.fillStyle = this.fillStyle || 'white' //this.fillStyle
        ctx.fill(path)
        ctx.strokeStyle = 'black' //this.strokeStyle
        ctx.lineWidth = 1 //this.lineWidth;
        ctx.stroke(path);

        //this.drawHandlers(ctx);
        if (this.hasText) this.drawTexts(ctx);

       this.restoreDraw(ctx,cx,cy)

        this.path = path;
    }
    drawHandlers(ctx) {
        let handlerSize = this.app.handlerSize;
        const halfSize = handlerSize / 2;
        // Draw handler at each corner
        const corners = [
            { x: this.p1.x, y: this.p1.y },
            { x: this.p2.x, y: this.p1.y },
            { x: this.p2.x, y: this.p2.y },
            { x: this.p1.x, y: this.p2.y }
        ];
        corners.forEach(corner => {
            ctx.save();
            ctx.translate(corner.x, corner.y);
            ctx.fillStyle = this.selected ? this.app.selectedColor : this.app.handlerColor;
            ctx.fillRect(-halfSize, -halfSize, handlerSize, handlerSize);
            ctx.restore();
        });
    }

    drawTexts(ctx) {
        let label = this.area();
        let msr = this.getTextMeasure(ctx, label);
        ctx.fillStyle = 'black';
        let mx = (this.p1.x + this.p2.x) / 2;
        let my = (this.p1.y + this.p2.y) / 2;
        ctx.fillText(label, mx - msr.dx, my - msr.dy);
    }
    area() {
        let {dx,dy} = this.dxy();
        let area = dx * dy / 100;
        this.um = 'cm'
        let label = area.toFixed(1) + this.um + '²';
        return label;
    }
    dxy() {
        return {
            dx: this.width * this.mmSUpx,
            dy: this.height * this.mmSUpx
        }
    }
    hit(ctx,p) {
        if (!this.path) return false
        return ctx.isPointInPath(this.path, p.x, p.y)
    }

    hitHandler(ctx, p) {
        // Implement hit detection for handlers if needed
    }

    get um() {return this._um || 'mm'}
    set um(v) {
        if (v=='µ'||v=='mm'||v=='cm'||v=='m') this._um = v
        else this._um = 'mm'
    }
    get umf() {
        switch(this.um) {
            case 'µ': return 1
            case 'mm': return 1000
            case 'cm': return 10000
            case 'm': return 1000000
        }
    }

    getTextMeasure(ctx,label) {
        if (!this.msr) this.msr = {}
        if (!this.msr.h) {
            let msr = ctx.measureText('Ùg')
            this.msr.b = msr.actualBoundingBoxAscent
            this.msr.h = this.msr.b + msr.actualBoundingBoxDescent
            this.msr.dy = this.msr.h/2-this.msr.b
        }
        if (!this.msr.w) {
            let msr = ctx.measureText(label)
            this.msr.w = msr.width
            this.msr.dx = msr.width/2
        }
        return this.msr
    }
  
    prepareDraw(ctx,cx,cy) {
        if (this.rotation || this.scale) {
            ctx.save()
            ctx.translate(cx,cy)
            if (this.rotation) ctx.rotate(this.rotation*Math.PI/180)
            if (this.scale) ctx.scale(this.scale,this.scale)
            ctx.translate(-cx,-cy)
        }
    }
    restoreDraw(ctx,cx,cy) {
        if (this.rotation || this.scale) {
            ctx.translate(cx,cy)
            if (this.rotation) ctx.rotate(-this.rotation*Math.PI/180)
            if (this.scale) ctx.scale(1/this.scale,1/this.scale)
            ctx.translate(-cx,-cy)
            ctx.restore()
        }
    }

}

class Grid {
    get startPoint() { return this._startPoint || {x:0,y:0} }
    set startPoint(v) { this._startPoint = v }
    get dim() { return this._dim || 50 }
    set dim(v) { this._dim = v } 
    get space() { return this._space || 10 }
    set space(v) { this._space = v } 
    get width() { return this.dim * this.space}
    get height() { return this.dim * this.space}
    draw(ctx) {
        let x0 = this.startPoint.x
        let y0 = this.startPoint.y
        let x1 = x0 + this.width
        let y1 = y0 + this.width
        let space = this.space
        ctx.lineWidth = 1
        ctx.strokeStyle = 'hsla(0,50%,50%,.5)'
        const path = new Path2D();
        for (let d=0; d<this.dim; d++) {
            path.moveTo(x0,y0+space*d)
            path.lineTo(x1,y0+space*d)
            path.moveTo(x0+space*d,y0)
            path.lineTo(x0+space*d,y1)
        }
        ctx.stroke(path)
    }
}

export class PiCoCanvas extends PiCoComponent {
    template() {
        return `
            <style>
                viewport {
                    display: flex;
                    width: 100%;
                    height: 100%;
                }
                canvas, overhtml {
                    position: absolute;
                    display: block;
                    width: 100%;
                    height: 100%;
                    background-color: bisque;
                }
                #temp-canvas {
                    background-color: transparent;
                }
                overhtml {
                    position: absolute;
                    background-color: hsla(0,80%,50%,0);
                }
                box {
                    box-sizing: border-box;
                    display: grid;
                    position: absolute;
                    --border-radius: 9%;
                    place-content: center;
                    color: black;
                    background-color: hsla(200,80%,50%,.7);
                }
            </style>
            <viewport>
                <canvas></canvas>
                <canvas id="temp-canvas"></canvas>
                <overhtml></overhtml>
            </viewport>
        `
    }
    onCreation() {
        this.style.display = 'inline-block'
        this.style.width = '100%'
        this.canvas = this.shadowRoot.querySelector('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.overhtml = this.shadowRoot.querySelector('overhtml')

        this.tempCanvas = this.shadowRoot.querySelector('#temp-canvas')
        this.tctx = this.tempCanvas.getContext('2d')

        this.redraw = (count)=>{
            requestAnimationFrame(this.redraw);
            this.ctx.clearRect(-100000, -100000, 200000, 200000)


            //if (this._image) this.ctx.drawImage(this._image,(this.canvas.width-this._image.width)/2,(this.canvas.height-this._image.height)/2,this._image.width,this._image.height)
            // if (this.grid) this.grid.draw(this.ctx)


            if (!this.shapes) return
            this.shapes.forEach(s=>s.draw(this.ctx))

            this.tctx.clearRect(-100000, -100000, 200000, 200000)
            this.selector.draw(this.tctx)

            this.drawAxes(this.ctx)


        }
        this.resize = (entry)=>{
            let CBB = this.canvas.getBoundingClientRect()
            let dw = CBB.width-this.initialWidth
            let dh = CBB.height-this.initialHeight
            this.canvas.width = this.tempCanvas.width = CBB.width
            this.canvas.height = this.tempCanvas.height = CBB.height

            // if (cornice) {
            //     cornice.p1 = {x:-10,y:-10}
            //     cornice.p2 = {x:this.canvas.width/2,y:this.canvas.height/2}
            // }

            let z = this._zoom
            let r = this._rotate
            let t = this._translate
            this.reset()
            this.zoom(z,true)
            if (t) this.translate(t.x,t.y,true)
            if (r) this.rotate(r,true)

            this.center()
        }
        new ResizeObserver(this.resize).observe(this.canvas)

        let CBB = this.canvas.getBoundingClientRect()
        this.initialWidth = CBB.width
        this.initialHeight = CBB.height

        this.overhtml._translate = {x:0,y:0}
        this.overhtml._rotate = 0

        this.shapes = []
        this.selector = new Rect
        this.selector.fillStyle = 'hsla(200,80%,50%,.2)'



        this.grid = new Grid
        this.grid.startPoint = {x: (this.canvas.width-this.grid.width)/2, y: (this.canvas.height-this.grid.height)/2}
        this.mmSUpx = 500/this.grid.width

        // let cornice = new Rect
        // this.shapes.push(cornice)

        this.canvas.addEventListener('keydown', e=>console.log(e))
        this.resize()
        this.reset()
        this.redraw()


    }
    static get observedAttributes() { 
        return ['size']
    }
    onAttributeChanged(name, oldValue, newValue) {
        switch (name) {
            case 'size': {
                break
            }
        }
    }


    drawArrowLine(ctx,x0,y0,x1,y1,col) {
        ctx.save();
        ctx.beginPath()
        let dx = x1-x0
        let dy = y1-y0
        let r = dx?Math.atan(dy/dx):(dy>0?.5*Math.PI:-.5*Math.PI)
        if (dx<0) r+=Math.PI
        ctx.moveTo(x0,y0)
        ctx.lineTo(x1,y1)
        ctx.stroke()
        ctx.closePath()
        ctx.restore();

        function arrow(ctx, s, x, y, r, col){
            ctx.save();
            ctx.beginPath();
            ctx.translate(x,y)
            ctx.rotate(r)
            ctx.moveTo(0,0);
            ctx.lineTo(-s*2,-s);
            ctx.lineTo(-s*2,s);
            ctx.lineTo(0,0);
            ctx.closePath();
            ctx.fillStyle = col
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        arrow(ctx, 5, x1, y1, r, col)

    }
    drawAxes(ctx) {
        this.drawArrowLine(ctx,0,0,100,0,'orange')
        this.drawArrowLine(ctx,0,0,0,-100,'green')
        this.drawArrowLine(ctx,0,0,-30,30,'red')
        // ctx.save();
        // ctx.beginPath()
        // ctx.moveTo(-10,0)
        // ctx.lineTo(50,0)
        // ctx.moveTo(0,-10)
        // ctx.lineTo(0,50)
        // ctx.stroke()
        // ctx.closePath()
        // ctx.restore();

        // function arrow(ctx, s, x, y, r, col){
        //     ctx.save();
        //     ctx.beginPath();
        //     ctx.translate(x,y)
        //     ctx.rotate(r)
        //     ctx.moveTo(0,0);
        //     ctx.lineTo(-s*2,-s);
        //     ctx.lineTo(-s*2,s);
        //     ctx.lineTo(0,0);
        //     ctx.closePath();
        //     ctx.fillStyle = col
        //     ctx.fill();
        //     ctx.stroke();
        //     ctx.restore();
        // }
        // arrow(ctx, 5, 50, 0, 0, 'orange')
        // arrow(ctx, 5, 0, 50, .5*Math.PI, 'green')
    }
    setBackgroundImage(image) {
        this._image = image
        this.mmSUpx = 400/this._image.width
    }
    addShape(s) {
        this.shapes.push(s)
        // this.redraw()
    }

    center() {
        let x = (this.canvas.width - this.initialWidth)/2
        let y = (this.canvas.height - this.initialHeight)/2
        x = this.canvas.width/2
        y = this.canvas.height/2
        this.translate(x,y,true)
    }

    reset() {
        this.ctx.reset()
        this._translate = {x:0,y:0}
        this._rotate = 0
        this._zoom = 1
        this._zoomTranslation = {x:0,y:0}

        this.overhtml._translate = {x:0,y:0}
        this.overhtml._rotate = 0
        this.adjustOverhtml()
        // this.redraw()
    }

    translate(dx,dy,force) {
        let a = this._rotate/180*Math.PI
        let cosa = Math.cos(a)
        let sina = Math.sin(a)
        let rdx = dx*cosa + dy*sina
        let rdy = dy*cosa - dx*sina
        if (force) this.ctx.translate(-this._translate.x,-this._translate.y)
        this._translate.x = force?rdx:this._translate.x+rdx
        this._translate.y = force?rdy:this._translate.y+rdy
        this.ctx.translate(rdx,rdy)

        this.adjustOverhtml()
        //this.redraw()
    }
    
    rotate(g,force) {
        let cx = this.canvas.width*this._zoom/2
        let cy = this.canvas.height*this._zoom/2
        this.ctx.translate(cx-this._translate.x+this._zoomTranslation.x, cy-this._translate.y+this._zoomTranslation.y)
        if (force) this.ctx.rotate(-this._rotate * Math.PI / 180)
        this._rotate = force?g:this._rotate+g
        this.ctx.rotate(g * Math.PI / 180)
        this.ctx.translate(-cx+this._translate.x-this._zoomTranslation.x, -cy+this._translate.y-this._zoomTranslation.y)
        
        this.adjustOverhtml()
        //this.redraw()
    }

    zoom(z,force) {
        let cw = this.canvas.width
        let ch = this.canvas.height
        let rotate = this._rotate
        let translate = this._translate
        let zoom = this._zoom
        this.reset()
        this._zoom = force?z:zoom*z
        this._zoomTranslation = {x:(cw-cw*this._zoom)/2, y:(ch-ch*this._zoom)/2}
        this.ctx.translate(this._zoomTranslation.x, this._zoomTranslation.y)
        this.ctx.scale(this._zoom,this._zoom)
        this.translate(translate.x,translate.y,true)
        this.rotate(rotate,true)

        this.adjustOverhtml()
        //this.redraw()
    }

    adjustOverhtml() {
        this.overhtml._translate = this._translate
        let t = this._zoomTranslation
        let z = this._zoom
        let r = this.overhtml._rotate = this._rotate
        let x = this.overhtml._translate.x * z
        let y = this.overhtml._translate.y * z
        this.overhtml.style.transform = `rotateZ(${r}deg) translate(${x+'px'},${y+'px'}) scale(${z},${z})`
        // console.log(this.overhtml.style.transform)
        // console.log(this._zoomTranslation,this._translate, this._zoom)
        // console.log(-this._zoomTranslation.x+this._translate.x, -this._zoomTranslation.y+this._translate.y)
        // console.log(this._zoom)

    }

    keydown(e) {this.manageKeyEvents(e)}
    manageKeyEvents(e) {
        console.log('CANVAS KEYEVENT:',e.keyCode)
        switch (e.keyCode) {
            case 37: {
                e.preventDefault()
                this.translate(-10,0)
                break
            }
            case 38: {
                e.preventDefault()
                this.translate(0,-10)
                break
            }
            case 39: {
                e.preventDefault()
                this.translate(10,0)
                break
            }
            case 40: {
                e.preventDefault()
                this.translate(0,10)
                break
            }
            case 72: {
                e.preventDefault()
                if (e.metaKey) {
                    this.reset()
                    this.center()
                }
                break
            }
            case 82: {
                e.preventDefault()
                if (e.metaKey) {
                    if (e.shiftKey) this.rotate(-45)
                    else this.rotate(45)
                }
                break
            }
            case 48: {  // Cmd- 0 -> Zoom: Actual Size
                if (e.metaKey) {
                    this.zoom(1,true)
                }
                break
            }
            case 187: {  // Cmd- + -> Zoom: In
                if (e.metaKey) {
                    e.preventDefault()
                    this.zoom(1.2)
                }
                break
            }
            case 189: {  // Cmd- - -> Zoom: Out
                if (e.metaKey) {
                    e.preventDefault()
                    this.zoom(1/1.2)
                }
                break
            }
            default: {
                //e.preventDefault()
                break
            }
        }
    }

    down(sp,e) {
        evm.keyTarget = this
        let r = this.canvas.getBoundingClientRect()
        r.x += window.scrollX
        r.y += window.scrollY
        this.__crect = r
        sp.x -= r.x
        sp.y -= r.y
        //let p = this.win2ctxPoint(sp)
        this.selector.p1 = sp
        this.selector.p2 = sp
    }
    move(sp,ep,dp,e) {
        let r = this.__crect
        ep.x -= r.x
        ep.y -= r.y
        //let p = this.win2ctxPoint(ep)
        this.selector.p2 = ep
    }
    up(sp,ep,e) {
        let r = this.__crect
        ep.x -= r.x
        ep.y -= r.y

        if (this.selector.p1.x == this.selector.p2.x && this.selector.p1.y == this.selector.p2.y) return 

        // compute the center of the selector shape and
        // tranlate to the canvas consistently with rotation
        let x = (this.selector.p1.x + this.selector.p2.x)/2
        let y = (this.selector.p1.y + this.selector.p2.y)/2
        let cc = this.win2ctxPoint({x:x,y:y})

        // refix the pointe p1 e p2 of the shape according to its
        // computed center on the canvas (cc) and its width and height
        let w = Math.abs(this.selector.p1.x - this.selector.p2.x)
        let h = Math.abs(this.selector.p1.y - this.selector.p2.y)
        this.selector.p1.x = cc.x-w/2
        this.selector.p1.y = cc.y-h/2
        this.selector.p2.x = cc.x+w/2
        this.selector.p2.y = cc.y+h/2
        this.selector.rotation = -this._rotate
        this.selector.scale = 1/this._zoom
        this.selector.width = w
        this.selector.height = h
        this.selector.mmSUpx = this.mmSUpx/this._zoom
        this.selector.hasText = true
        // finally add the shape to the canvas
        this.addShape(this.selector)

        // let rect = new Rect
        // rect.fillStyle = 'hsla(0,80%,50%,.3)'
        // let ap = 5
        // rect.p1 = {x:cc.x-ap,y:cc.y-ap}
        // rect.p2 = {x:cc.x+ap,y:cc.y+ap}
        // this.addShape(rect)
        // let b = document.createElement('box')
        // b.style.left = (cc.x-ap).toFixed(13)+'px'
        // b.style.top = (cc.y-ap.toFixed(13))+'px'
        // b.style.width = (2*ap).toFixed(13)+'px'
        // b.style.height = (2*ap.toFixed(13))+'px'
        // this.overhtml.appendChild(b)

        let box = document.createElement('box')
        this.overhtml.appendChild(box)
        box.style.width = w+'px'
        box.style.height = h+'px'
        box.rotate = -this.overhtml._rotate
        box.scale = 1/this._zoom
        box.trs = {x:this.selector.p1.x+'px',y:this.selector.p1.y+'px'}
        box.style.transform = `translate(${box.trs.x},${box.trs.y}) rotateZ(${box.rotate}deg)  scale(${box.scale},${box.scale})`

        // console.log(box.scale, )

        // console.log(this.selector.p1, box.style.left, box.style.top)

        // create a new selector
        this.selector = new Rect
        this.selector.fillStyle = 'hsla(200,80%,50%,.2)'
    }

    win2ctxPoint(p) {
        let zt = this._zoomTranslation
        let t = this._translate
        let z = this._zoom
        
        let x = (p.x - zt.x)/z - t.x
        let y = (p.y - zt.y)/z - t.y
        let cx = (this.canvas.width/2 - zt.x)/z - t.x
        let cy = (this.canvas.height/2 - zt.y)/z - t.y
        let r = Math.sqrt((cx-x)*(cx-x)+(cy-y)*(cy-y))
        if (r==0) return {x:cx,y:cy}
        let cos = (x-cx)/r
        let sin = (y-cy)/r
        let a = sin>=0?Math.acos(cos):2*Math.PI-Math.acos(cos)
        let na = a-this._rotate*Math.PI/180
        x = cx + r*Math.cos(na)
        y = cy + r*Math.sin(na)
        return {x:x,y:y}
    }

    info() {
        let cx = this.canvas.width/2
        let cy = this.canvas.height/2
        let cc = this.win2ctxPoint({x:309,y:209})
        let x = cx
        let y = cy
        this.translate(x-cc.x,y-cc.y)
        console.log(cx,cy,cc)
    }
}

try { customElements.define('pc-canvas', PiCoCanvas) } catch {}
