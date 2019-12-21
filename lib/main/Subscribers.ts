import { Async } from "./Async"

/**
 * A class used to store subscribers for events
 */
export class Subscribers<T extends (...args: any) => Async.MaybeAsync<any>> {
    protected list = new Set<T>()

    /**
     * Adds the given subscriber.
     */
    add(func: T) {
        this.list.add(func)
    }

    /**
     * Invoke all subscribers.
     * The returned Promise will resolve after all functions have been resolved.
     * @param clearAll Wether all subscribers should be removed after invoking.
     */
    async notifyAll(clearAll = true, ...args: Parameters<T>) {
        await Promise.all(
            Array.from(this.list).map(it => Async.wrapInPromise(it)(...args))
        )

        if(clearAll) this.list.clear()
    }
}
