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
