export function parseHeadersObject(obj: { [key: string]: string | string[] | undefined }){
    const newObj: { [key: string]: string | string[] | undefined } = {}
    for(const key in obj)
        newObj[key.toLowerCase()] = obj[key]
    return newObj
}

export function parseAcceptHeader(content: string): ReadonlySet<[string, number]> {
    return new Set(
        content
            .split(",")
            .map(it => it.trim())
            .filter(it => it !== "")
            .map(it => {
                const [code, q = "1"] = it.split(";q=")
                return [code, parseFloat(q)] as [string, number]
            })
    )
}

export function parseCookieHeader(content: string): ReadonlyMap<string, string> {
    const map = new Map()

    const cookieList = content
        .split(";")
        .map(it => it.trim())
        .filter(it => it !== "")
        .map(it => it.split("=", 2))

    for(const [key, value] of cookieList)
        map.set(key, value)

    return map
}
