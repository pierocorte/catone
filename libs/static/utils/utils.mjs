function isClass(c) {
    return typeof c === 'function' && /^\s*class\s+/.test(c.toString());
}

export function inherits(c, ...sups) {
    if (!isClass(c)) throw 'Error: the target object is not a class'
    let to = c.prototype
    let sm = Object.getOwnPropertyNames(to)
    sups.forEach(sup=>{
        if (!isClass(sup)) throw 'Error: some sup object is not a class'
        let from = sup.prototype
        let fm = Object.getOwnPropertyNames(from)
        fm.filter(e=>e!='constructor').forEach(p=>{
            let m = sm.find(m=>m==p)
            if (!m) to[p]=from[p] // inherits only those methods that are not overridden!
            else to['super_'+p]=from[p] // overridden methods are prefixed with 'super'
        })
    })
}

class IDGen {
    constructor() {
        this._id = 0
    }
    get id() {return ++this._id}
    reset() {this._id = 0}
}
export const idGen = new IDGen()

export class Persistable {
    constructor() {
        this.init_Persistable()
    }
    init_Persistable() {
        this.cname = this.constructor.name
        this.id = idGen.id
        this.pid = undefined    // PERSISTENT ID - used to restore associations when loading a project
        this.oid = undefined    // ORIGINAL ID - used on copied elements to refer their original elements
    }
    getPState() {
        return {
            cname: this.cname,
            pid:this.id,
        }
    }
    setPState(s) {
        this.cname = s.cname
        this.pid = s.pid
    }
    resolveRef(ref) {
    }
    // getState() {
    //     return this.getPState()
    // }
    // setState(s) {
    //     this.setPState(s)
    // }

}

// COLORED CONSOLE LOG.
// e.g.:  $L(bg(128,0,0),fg(255,255,255),'HELLO WORLD',cg())
//     log the text HELLO WORLD in WHITE (fg) on DARK-RED (bg) and reset the color (cg) at the end
export function fg(r,g,b) { return `\x1b[38;2;${r};${g};${b}m` }
export function bg(r,g,b) { return `\x1b[48;2;${r};${g};${b}m` }
export function cg()   { return `\x1b[0m` }
export const $L = console.log
export let $INF = (...args)=>console.log( bg(0,224,0), 'INFO:', bg(224,224,224), fg(192,0,0), ...args, '',cg())
export let $ERR = (...args)=>console.log( bg(224,0,0), 'ERROR:', bg(224,224,224), fg(192,0,0), ...args, '',cg())
export let $DBG = (...args)=>console.log( bg(0,0,224), 'DEBUG:', bg(224,224,224), fg(192,0,0), ...args, '',cg())

try {
    window
    $INF = (...args)=>console.log('INFO:', ...args)
    $ERR = (...args)=>console.log('ERROR:', ...args)
    $DBG = (...args)=>console.log('DEBUG:', ...args)
} catch {}

$DBG = ()=>{}


export function kebabToCamel(str) {
    return str
        .split('-')
        .map((word, index) =>
            index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join('');
}