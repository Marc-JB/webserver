import { UrlWithParams } from "./UrlWithParams"

export interface ReadonlyHttpRequestInf {
    readonly url: UrlWithParams
    readonly method: string
    readonly headers: ReadonlyMap<string, string | string[]>
    readonly body: Promise<string | null>
    readonly authentication: any
    readonly options: ReadonlyMap<string, any>
}

export interface HttpRequestInf extends ReadonlyHttpRequestInf {
    authentication: any
    readonly options: Map<string, any>
}
