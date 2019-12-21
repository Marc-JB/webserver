export namespace Async {
    /**
     * A type where it's not clear if T is T or if T is the result type of a Promise
     */
    export type MaybeAsync<T> = T | Promise<T>

    type PromiseResultType<T extends MaybeAsync<any>> = T extends Promise<infer R> ? R : T

    /**
     * Takes any sync or async function.
     * - When sync: Returns a function with the result wrapped into a promise.
     * - When async: Returns the same function.
     * @param fn A function (async or sync)
     */
    export function wrapInPromise<T extends (...args: any) => MaybeAsync<any>>(fn: T) {
        return (...args: Parameters<T>): Promise<PromiseResultType<ReturnType<T>>> => {
            try {
                // @ts-ignore
                const result = fn(...args)
                /** @todo: check if the function call above has any side-effects */
                return result instanceof Promise ? result : Promise.resolve(result)
            } catch (err) {
                return Promise.reject(err)
            }
        }
    }

    export function sleep(timeInMilliSeconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, timeInMilliSeconds))
    }
}

export namespace Maps {
    /**
     * Takes all top-level key/value pairs in this object and writes it into a map
     * @param obj The object to read key/value pairs from
     * @param map The map to write into (an empty map by default)
     * @param omitUndefined true if key/value pairs with a value of undefined should be ignored
     * @returns The newly created map (can be ignored if you have a reference to the map and passed that into the function)
     */
    export function rewriteObjectAsMap<T>(obj: { [key: string]: T }, map: Map<string, T extends undefined ? never : T> = new Map(), omitUndefined = true): Map<string, T extends undefined ? never : T> {
        for(const key in obj) {
            const value = obj[key]
            if(value !== undefined || !omitUndefined) {
                map.set(key, value as T extends undefined ? never : T)
            }
        }
        return map
    }

    /**
     * Takes all top-level key/value pairs in this map and writes it into an object
     * @param map The map to read key/value pairs from
     * @param obj The object to write into (an empty object by default)
     * @param omitUndefined true if key/value pairs with a value of undefined should be ignored
     * @returns The newly created object (can be ignored if you have a reference to the object and passed that into the function)
     */
    export function rewriteMapAsObject<T>(map: ReadonlyMap<string, T>, obj: { [key: string]: T } = {}, omitUndefined = true): { [key: string]: T } {
        for(const [key, value] of map) {
            if(value !== undefined || !omitUndefined) {
                obj[key] = value
            }
        }
        return obj
    }
}

export class Lazy<T> {
    protected isSet = false
    protected _value?: T

    constructor(protected readonly initialiser: () => T) {}

    get isInitialized(): boolean {
        return this.isSet
    }

    get value(): T {
        if(!this.isSet) {
            this.isSet = true
            this._value = this.initialiser()
        }

        return this._value as T
    }
}

export class Subscribers {
    protected list = new Set<() => any>()

    add(func: () => any) {
        this.list.add(func)
    }

    async notifyAll() {
        await Promise.all(
            Array.from(this.list).map(it => Async.wrapInPromise(it)())
        )

        this.list.clear()
    }
}
