import { Http2ServerRequest } from "http2"
import { parse, UrlWithParsedQuery } from "url"
import { HttpRequestInf } from "./HttpRequestInf"
import { Maps, Lazy, StreamToPromise } from "../lib"
import { UrlWithParams } from "./UrlWithParams"

function parseUrl(url: string): UrlWithParams {
    const parsedWithoutParams = parse(url, true) as UrlWithParsedQuery & { params?: Map<string, string> }
    parsedWithoutParams.params = new Map()
    return parsedWithoutParams as UrlWithParams
}

export class HttpRequest implements HttpRequestInf {
    public readonly url: UrlWithParams = parseUrl(this.request.url)
    public readonly method: string = this.request.method.toUpperCase()
    public readonly headers: ReadonlyMap<string, string | string[]> = Maps.rewriteObjectAsMap(this.request.headers)

    private readonly _body = new Lazy(() => new StreamToPromise(this.request).getResult())

    public get body(): Promise<string | null> {
        return this._body.value
    }

    /**
     * An authentication object
     * Defaults to *null*, add an authentication middleware to change the value
     */
    public authentication: any = null

    /** Options passed trough by middleware. */
    public readonly options: Map<string, any> = new Map()

    constructor(protected readonly request: Http2ServerRequest){}
}
