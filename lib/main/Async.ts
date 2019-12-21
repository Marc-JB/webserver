import { Observable } from "./Observable"

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

    /**
     * Resolves the returned promise after a specified amount of time
     * @param timeInMilliSeconds the time to wait until the promise is resolved
     */
    export function sleep(timeInMilliSeconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, timeInMilliSeconds))
    }
}

/**
 * Class used to read text from a stream into a promise
 * Note: wrap the constructor call in a Lazy initialiser to delay the reading of the stream
 */
export class StreamToPromise {
    protected isDone = false
    protected result = new Observable<string | null>(null)

    constructor (protected readonly stream: { [Symbol.asyncIterator](): AsyncIterableIterator<string> }) {
        this.startReading()
    }

    protected async startReading() {
        let incomingData = ""
        let chunksRead = 0
        for await(const chunk of this.stream){
            incomingData += chunk
            chunksRead++
        }
        this.isDone = true
        this.result.set(chunksRead === 0 ? null : incomingData)
    }

    /**
     * Returns a Promise with all text from the stream (null when stream is empty)
     */
    public getResult(): Promise<string | null> {
        return this.isDone ? Promise.resolve(this.result.get()) : this.result.observeOncePromise()
    }
}
