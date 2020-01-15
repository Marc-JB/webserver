import { Http2ServerRequest } from "http2"
import { IncomingMessage as Http1ServerRequest } from "http"
import { HttpRequest } from "./HttpRequest"
import { Maps, Lazy, StreamToPromise, ContentEncoding } from "../lib"
import { UrlWithParams, parseUrl, parseUrlWithParams } from "../Url"
import { parseHeadersObject, parseAcceptHeader, parseCookieHeader } from "./Parsers"
import { Json } from "../../../lib/main"

export class HttpRequestImpl implements HttpRequest {
    public readonly headers: ReadonlyMap<string, string | string[]> = Maps.rewriteObjectAsMap(parseHeadersObject(this.request.headers))

    public readonly url: UrlWithParams = parseUrlWithParams(this.headers.get(":scheme") + "://" + this.headers.get(":authority") + this.request.url ?? "")
    public readonly method: string = (this.request.method ?? "GET").toUpperCase()

    public readonly dataSaverEnabled = this.headers.has("save-data") ? this.headers.get("save-data") === "on" : null
    public readonly doNotTrackEnabled = this.headers.has("dnt") ? this.headers.get("dnt") === "1" : null

    public readonly referer = this.headers.has("referer") ? parseUrl(this.headers.get("referer") as string) : null
    /** @deprecated */
    public readonly userAgent = (this.headers.get("user-agent") ?? null) as string | null

    public readonly acceptedContentTypes = parseAcceptHeader(this.headers.get("accept") as string ?? "")
    public readonly acceptedLanguages = parseAcceptHeader(this.headers.get("accept-language") as string ?? "")
    public readonly acceptedContentEncodings = parseAcceptHeader(this.headers.get("accept-encoding") as string ?? "") as ReadonlySet<[ContentEncoding | "*", number]>
    public readonly acceptedContentCharsets = parseAcceptHeader(this.headers.get("accept-charset") as string ?? "")

    /** @deprecated */
    public readonly cookies = parseCookieHeader(this.headers.get("cookie") as string ?? "")

    private readonly _body = new Lazy(() => new StreamToPromise(this.request).getResult())

    public get body(): Promise<string | null> {
        return this._body.value
    }

    public readonly customSettings = new Map()

    constructor(protected readonly request: Http2ServerRequest | Http1ServerRequest){}

    toJSON(): Json {
        return {
            url: this.url,
            method: this.method,
            headers: Maps.rewriteMapAsObject(this.headers),
            dataSaverEnabled: this.dataSaverEnabled,
            doNotTrackEnabled: this.doNotTrackEnabled,
            referer: this.referer,
            userAgent: this.userAgent,
            acceptedContentTypes: Array.from(this.acceptedContentTypes).map(it => `${it[0]} (${it[1]})`),
            acceptedLanguages: Array.from(this.acceptedLanguages).map(it => `${it[0]} (${it[1]})`),
            acceptedContentEncodings: Array.from(this.acceptedContentEncodings).map(it => `${it[0]} (${it[1]})`),
            acceptedContentCharsets: Array.from(this.acceptedContentCharsets).map(it => `${it[0]} (${it[1]})`),
            cookies: Maps.rewriteMapAsObject(this.cookies),
            customSettings: Maps.rewriteMapAsObject(this.customSettings)
        } as unknown as Json
    }
}
