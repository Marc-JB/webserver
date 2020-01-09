/**
 * A class which wraps a property and allows observers to get notified when the property changes
 */
export class Observable<T> {
    protected readonly observers = new Set<(value: T, observable: Observable<T>) => boolean>()

    /**
     * @param value The initial value
     */
    constructor(protected storedValue: T){}

    /**
     * Retreives the current value.
     */
    get value(): T {
        return this.storedValue
    }

    /**
     * Changes the value to the new value and notifies all observers.
     * @param newValue The new value
     */
    set value(newValue: T) {
        this.storedValue = newValue

        for (const observer of this.observers){
            const keepObserving = observer(newValue, this)
            if(!keepObserving)
                this.observers.delete(observer)
        }
    }

    /**
     * Adds the given function to the list of observers (until false gets returned from that function)
     * @param func A function which takes a value and returns wether or not it wants to keep observing (false removes the observer)
     */
    observe(func: (value: T, observable: Observable<T>) => boolean) {
        this.observers.add(func)
    }

    /**
     * @returns a promise which will resolve at the first time set() is called
     */
    observeOncePromise(): Promise<T> {
        return new Promise<T>(resolve => {
            this.observe(value => {
                resolve(value)
                return false
            })
        })
    }
}
