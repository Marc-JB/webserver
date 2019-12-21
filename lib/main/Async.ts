import { Subscribers } from "./Subscribers"

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

enum StreamReadState {
    NOT_STARTED, READING, DONE
}

export class StreamToPromise {
    protected state = StreamReadState.NOT_STARTED
    protected subscribers = new Subscribers()
    protected result: string | null = null

    constructor (protected readonly stream: { [Symbol.asyncIterator](): AsyncIterableIterator<string> }) {}

    protected async readStream(): Promise<void> {
        let incomingData = ""
        let chunksRead = 0
        this.state = StreamReadState.READING
        for await(const chunk of this.stream){
            incomingData += chunk
            chunksRead++
        }
        this.result = chunksRead === 0 ? null : incomingData
        this.state = StreamReadState.DONE
        this.subscribers.notifyAll()
    }

    public async getBody(): Promise<string | null> {
        if (this.state === StreamReadState.NOT_STARTED){
            await this.readStream()
        } else if (this.state === StreamReadState.READING){
            await new Promise(resolve => { this.subscribers.add(resolve) })
        }

        return this.result
    }
}
