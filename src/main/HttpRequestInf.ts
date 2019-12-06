import { UrlWithParsedQuery } from "url"

export interface HttpRequestInfCore {
    readonly url: UrlWithParsedQuery
    readonly method: string
    readonly headers: ReadonlyMap<string, string | string[]>
    readonly body: Promise<string | null>
}

export interface HttpRequestInf extends HttpRequestInfCore {
    authentication: any
    readonly options: Map<string, any>
}

export interface HttpRequestInfWithParams extends HttpRequestInf {
    readonly params: ReadonlyMap<string, string>
}

export interface HttpRequestInfWithParamsInternal extends HttpRequestInfWithParams {
    readonly params: Map<string, string>
}
