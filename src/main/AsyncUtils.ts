export type MaybeAsync<T> = T | Promise<T>

type PromiseResultType<T extends MaybeAsync<any>> = T extends Promise<infer R> ? R : T

export function wrapInPromise<T extends (...args: any) => MaybeAsync<any>>(fn: T) {
    return (...args: Parameters<T>): Promise<PromiseResultType<ReturnType<T>>> => {
        try {
            const result = fn(args)
            return result instanceof Promise ? result : Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
