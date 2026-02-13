export class Observable {
    _addObserver(observer) {
        if (!this.observers) this.observers = []
        this.observers.push(observer)
    }
    _removeObserver(observer) {
        if (!this.observers) return
        const removeIndex = this.observers.findIndex(obs => observer === obs)
        if (removeIndex != -1) this.observers.splice(removeIndex, 1)

    }
    // Loops over this.observers and calls the notified method on each observer.
    // The observable object must call this method everytime it wants to notify changes.
    notify(event) {
        if (!this.observers) return
        this.observers.forEach(observer => observer.notified(this, event))
    }
}

export class Observer {
    observe(observable) {
        if (observable) observable._addObserver(this)
    }
    ignore(observable) {
        if (observable) observable._removeObserver(this)
    }
    notified(source,event) {
        console.log(`NOTIFIED ${this.constructor.name}:`,source,event)
    }
}
