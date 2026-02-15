import { Observable } from "./mv.mjs";

export class Action extends Observable {
    constructor(name) {
        super();
        this._name = name;
        this._disabled = false;
    }
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
        this.notify({ name: name });
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
        this.notify({ disabled: value });
    }
    get action() {
        return this._action
    }
    set action(action) {
        this._action = action;
        this.notify({ action: action });
    }

    call(...args) {
        if (!this._disabled) this.invoke(...args);
    }

    invoke(...args) {
        // To be implemented by subclasses
    }

    static #registeredActions = {};
    static registerAction(name, action) {
        Action.#registeredActions[name] = action;
    }
    static getAction(name) {
        return Action.#registeredActions[name];
    }
    static unregisterAction(name) {
        delete Action.#registeredActions[name];
    }
}