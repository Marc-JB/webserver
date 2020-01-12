import { Http2ServerRequest } from "http2"
import { IncomingMessage as Http1ServerRequest } from "http"
import { HttpRequest } from "./HttpRequest"
import { Maps, Lazy, StreamToPromise, ContentEncoding } from "../lib"
import { UrlWithParams, parseUrl, parseUrlWithParams } from "../Url"
import { parseHeadersObject, parseAcceptHeader, parseCookieHeader } from "./Parsers"

export class HttpRequestImpl implements HttpRequest {
    public readonly url: UrlWithParams = parseUrlWithParams(this.request.url ?? "")
    public readonly method: string = (this.request.method ?? "GET").toUpperCase()

    public readonly headers: ReadonlyMap<string, string | string[]> = Maps.rewriteObjectAsMap(parseHeadersObject(this.request.headers))

    public readonly dataSaverEnabled = this.headers.has("save-data") ? this.headers.get("save-data") === "on" : null
    public readonly doNotTrackEnabled = this.headers.has("dnt") ? this.headers.get("dnt") === "1" : null

    public readonly referer = this.headers.has("referer") ? parseUrl(this.headers.get("referer") as string) : null
    public readonly userAgent = (this.headers.get("user-agent") ?? null) as string | null

    public readonly acceptedContentTypes = parseAcceptHeader(this.headers.get("accept") as string ?? "")
    public readonly acceptedLanguages = parseAcceptHeader(this.headers.get("accept-language") as string ?? "")
    public readonly acceptedContentEncodings = parseAcceptHeader(this.headers.get("accept-encoding") as string ?? "") as ReadonlySet<[ContentEncoding | "*", number]>
    public readonly acceptedContentCharsets = parseAcceptHeader(this.headers.get("accept-charset") as string ?? "")

    public readonly cookies = parseCookieHeader(this.headers.get("cookie") as string ?? "")

    private readonly _body = new Lazy(() => new StreamToPromise(this.request).getResult())

    public get body(): Promise<string | null> {
        return this._body.value
    }

    public readonly customSettings = new Map()

    constructor(protected readonly request: Http2ServerRequest | Http1ServerRequest){}
}
