import { Http2ServerRequest } from "http2"
import { IncomingMessage as Http1ServerRequest } from "http"
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
    public readonly url: UrlWithParams = parseUrl(this.request.url ?? "")
    public readonly method: string = (this.request.method ?? "GET").toUpperCase()

    /** @todo lowercase all header keys */
    public readonly headers: ReadonlyMap<string, string | string[]> = Maps.rewriteObjectAsMap(this.request.headers)
    public readonly dataSaverEnabled = this.headers.has("save-data") ? this.headers.get("save-data") === "on" : null
    public readonly doNotTrackEnabled = this.headers.has("dnt") ? this.headers.get("dnt") === "1" : null

    private readonly _body = new Lazy(() => new StreamToPromise(this.request).getResult())

    public get body(): Promise<string | null> {
        return this._body.value
    }

    public readonly customSettings = new Map()

    constructor(protected readonly request: Http2ServerRequest | Http1ServerRequest){}
}
