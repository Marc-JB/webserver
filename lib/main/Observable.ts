export class Observable<T> {
    protected readonly observers = new Set<(t: T) => void>()
    protected readonly oneTimeObservers = new Set<(t: T) => void>()

    constructor(protected value: T){}

    get(): T {
        return this.value
    }

    set(newValue: T) {
        this.value = newValue

        for (const observer of this.observers)
            observer(newValue)

        for (const observer of this.oneTimeObservers)
            observer(newValue)

        this.oneTimeObservers.clear()
    }

    observe(func: (t: T) => void) {
        this.observers.add(func)
    }

    observeOnce(func: (t: T) => void) {
        this.oneTimeObservers.add(func)
    }

    observeOncePromise(): Promise<T> {
        return new Promise<T>(resolve => { this.observeOnce(resolve) })
    }
}
