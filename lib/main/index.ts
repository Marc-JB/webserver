export namespace Async {
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
}

export namespace Maps {
    export function rewriteObjectAsMap<T>(obj: { [key: string]: T }, map: Map<string, T extends undefined ? never : T> = new Map(), omitUndefined = true): Map<string, T extends undefined ? never : T> {
        for(const key in obj) {
            const value = obj[key]
            if(value !== undefined || !omitUndefined) {
                map.set(key, value as T extends undefined ? never : T)
            }
        }
        return map
    }

    export function rewriteMapAsObject<T>(map: ReadonlyMap<string, T>, obj: { [key: string]: T } = {}, omitUndefined = true): { [key: string]: T } {
        for(const [key, value] of map) {
            if(value !== undefined || !omitUndefined) {
                obj[key] = value
            }
        }
        return obj
    }
}
