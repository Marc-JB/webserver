/**
 * @see https://en.wikipedia.org/wiki/Lazy_initialization
 */
export class Lazy<T> {
    protected isSet = false
    protected _value?: T

    constructor(protected readonly initialiser: () => T) {}

    get isInitialized(): boolean {
        return this.isSet
    }

    /**
     * Returns the initialised value.
     * Initialises the value upon first run.
     */
    get value(): T {
        if(!this.isSet) {
            this.isSet = true
            this._value = this.initialiser()
        }

        return this._value as T
    }
}
