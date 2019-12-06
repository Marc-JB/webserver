export function rewriteObjectAsMap<T>(obj: { [key: string]: T }, map: Map<string, T extends undefined ? never : T> = new Map()): Map<string, T extends undefined ? never : T> {
    for(const key in obj) {
        const value = obj[key]
        if(value !== undefined) {
            map.set(key, value as T extends undefined ? never : T)
        }
    }
    return map
}

export function rewriteMapAsObject<T>(map: ReadonlyMap<string, T>, obj: { [key: string]: T } = {}): { [key: string]: T } {
    for(const [key, value] of map) {
        obj[key] = value
    }
    return obj
}
