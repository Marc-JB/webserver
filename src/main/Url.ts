import { parse, UrlWithParsedQuery as Url } from "url"

export { Url }

export interface UrlWithParams extends Url {
    readonly params: ReadonlyMap<string, string>
}

export function parseUrlWithParams(url: string): UrlWithParams {
    const parsedWithoutParams = parse(url, true) as Url & { params?: Map<string, string> }
    parsedWithoutParams.params = new Map()
    return parsedWithoutParams as UrlWithParams
}

export function parseUrl(url: string): Url {
    return parse(url, true)
}
