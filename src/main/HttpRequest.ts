import { Http2ServerRequest } from "http2"
import { parse as parseUrl, UrlWithParsedQuery } from "url"
import { HttpRequestInf, HttpRequestInfCore, HttpRequestInfWithParams, HttpRequestInfWithParamsInternal } from "./HttpRequestInf"
import { Maps, Lazy, StreamToPromise } from "../../lib/main/index"

export class HttpRequestCore implements HttpRequestInfCore {
    public readonly url: UrlWithParsedQuery = parseUrl(this.request.url, true)
    public readonly method: string = this.request.method.toUpperCase()
    public readonly headers: ReadonlyMap<string, string | string[]> = Maps.rewriteObjectAsMap(this.request.headers)

    private readonly _body = new Lazy(() => new StreamToPromise(this.request).getResult())

    public get body(): Promise<string | null> {
        return this._body.value
    }

    constructor(protected readonly request: Http2ServerRequest){}
}

export class HttpRequest extends HttpRequestCore implements HttpRequestInf {
    /**
     * An authentication object
     * Defaults to *null*, add an authentication middleware to change the value
     */
    public authentication: any = null

    /** Options passed trough by middleware. */
    public readonly options: Map<string, any> = new Map()
}

export class HttpRequestWithParamsInternal extends HttpRequest implements HttpRequestInfWithParamsInternal {
    readonly params: Map<string, string> = new Map()

    static fromHttpRequest(r: HttpRequestInf): HttpRequestInfWithParamsInternal {
        const req = r as HttpRequestInf & { params?: Map<string, string> }
        req.params = new Map()
        return req as HttpRequestInfWithParamsInternal
    }

    static removeParams(r: HttpRequestInfWithParams): HttpRequestInf {
        const req = r as HttpRequestInf & { params: any }
        delete req.params
        return req as HttpRequestInf
    }
}
