function isClass(c) {
    return typeof c === 'function' && /^\s*class\s+/.test(c.toString());
}

export function inherits(c, ...sups) {
    if (!isClass(c)) throw 'Error: the target object is not a class'
    let to = c.prototype
    let sm = Object.getOwnPropertyNames(to)
    sups.forEach(sup => {
        if (!isClass(sup)) throw 'Error: some sup object is not a class'
        let from = sup.prototype
        let fm = Object.getOwnPropertyNames(from)
        fm.filter(e => e != 'constructor').forEach(p => {
            let m = sm.find(m => m == p)
            if (!m) to[p] = from[p] // inherits only those methods that are not overridden!
            else to['super_' + p] = from[p] // overridden methods are prefixed with 'super'
        })
    })
}

class IDGen {
    constructor() {
        this._id = 0
    }
    get id() { return ++this._id }
    reset() { this._id = 0 }
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
            pid: this.id,
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
export function fg(r, g, b) { return `\x1b[38;2;${r};${g};${b}m` }
export function bg(r, g, b) { return `\x1b[48;2;${r};${g};${b}m` }
export function cg() { return `\x1b[0m` }
export const $L = console.log
export let $INF = (...args) => console.log(bg(0, 224, 0), 'INFO:', bg(224, 224, 224), fg(192, 0, 0), ...args, '', cg())
export let $ERR = (...args) => console.log(bg(224, 0, 0), 'ERROR:', bg(224, 224, 224), fg(192, 0, 0), ...args, '', cg())
export let $DBG = (...args) => console.log(bg(0, 0, 224), 'DEBUG:', bg(224, 224, 224), fg(192, 0, 0), ...args, '', cg())

try {
    window
    $INF = (...args) => console.log('INFO:', ...args)
    $ERR = (...args) => console.log('ERROR:', ...args)
    $DBG = (...args) => console.log('DEBUG:', ...args)
} catch { }

$DBG = () => { }


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


// converte un nodo XML in un oggetto JS
export function nodeToObject(node) {
    // testo puro
    if (node.nodeType === 3) return node.nodeValue.trim();
    const obj = {};

    // attributi (prefisso "@")
    if (node.attributes?.length) {
        obj["@"] = {};
        for (const attr of node.attributes) obj["@"][attr.name] = attr.value;
    }

    // figli
    const children = [...node.childNodes].filter(n => n.nodeType !== 3 || n.nodeValue.trim() !== "");
    if (children.length === 0) return Object.keys(obj).length ? obj : ""; // elemento vuoto

    // raggruppa per tag
    for (const child of children) {
        if (child.nodeType === 3) {
            obj["#text"] = child.nodeValue.trim();
        } else {
            const key = child.nodeName;
            const val = nodeToObject(child);
            // gestisci ripetizioni come array
            if (key in obj) {
                if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
                obj[key].push(val);
            } else {
                obj[key] = val;
            }
        }
    }
    return obj;
}


export function formatDateDDMMYYYY(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export function dateFromDDMMYYYY(str) {
    const [d, m, y] = str.split("/").map(Number);
    return new Date(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
}

export function formatIsoToDdMmYyyy(isoString) {
  // Esempio input: "2026-02-06T12:34:56.000Z"
  const m = /^(\d{4})-(\d{2})-(\d{2})T/.exec(isoString);
  if (!m) throw new Error("Invalid ISO date string");
  const [, yyyy, mm, dd] = m;
  return `${dd}/${mm}/${yyyy}`;
}