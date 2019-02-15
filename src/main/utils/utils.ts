export namespace ArrayUtils {
    /**
     * @returns the largest array in terms of children (array.length)
     */
    export function largest(array1: any[], array2: any){
        return array1.length > array2.length ? array1 : array2
    }
}

export namespace StringUtils {
    /**
     * Removes the search string from the end of the string
     * @param str the main string
     * @param search the string to remove
     */
    export function removeEnd(str: string, search: string) {
        return str.endsWith(search) ? str.substring(0, str.length - search.length) : str
    }
    
    /**
     * Removes the search string from the front 
     * @param str the main string
     * @param search the string to remove
     */
    export function removeFront(str: string, search: string) {
        return str.startsWith(search) ? str.substring(search.length) : str
    }
    
    /**
     * Removes the front string from the front and end from the end
     * @param str the main string
     * @param front the front string
     * @param end the end string, defaults to the front string
     */
    export function removeEnds(str: string, front: string, end: string = front){
        return removeEnd(removeFront(str, front), end)
    }
}