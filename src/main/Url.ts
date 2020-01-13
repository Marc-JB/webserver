import { parse } from "url"

export interface Url {
    readonly auth: string | null
    readonly hash: string | null
    readonly host: string | null
    readonly hostname: string | null
    readonly href: string
    readonly path: string | null
    readonly pathname: string | null
    readonly protocol: string | null
    readonly search: string | null
    readonly slashes: boolean | null
    readonly port: string | null
    readonly query: ReadonlyMap<string, string | string[]>
}

export interface UrlWithParams extends Url {
    readonly params: ReadonlyMap<string, string>
}

export function parseUrlWithParams(url: string): UrlWithParams {
    const parsedWithoutParams = parseUrl(url) as Url & { params?: Map<string, string> }
    parsedWithoutParams.params = new Map()
    return parsedWithoutParams as UrlWithParams
}

export function parseUrl(url: string): Url {
    const parsedUrl = parse(url, true)
    const queryMap = new Map<string, string | string[]>()
    for(const key in parsedUrl.query) {
        queryMap.set(key, parsedUrl.query[key])
    }
    delete (parsedUrl as any).query;
    (parsedUrl as any).query = queryMap
    return (parsedUrl as any) as Url
}
