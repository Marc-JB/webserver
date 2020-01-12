import { Http2ServerRequest } from "http2"
import { IncomingMessage as Http1ServerRequest } from "http"
import { parse, UrlWithParsedQuery } from "url"
import { HttpRequestInf } from "./HttpRequestInf"
import { Maps, Lazy, StreamToPromise, ContentEncoding } from "../lib"
import { UrlWithParams } from "./UrlWithParams"

function parseUrl(url: string): UrlWithParams {
    const parsedWithoutParams = parse(url, true) as UrlWithParsedQuery & { params?: Map<string, string> }
    parsedWithoutParams.params = new Map()
    return parsedWithoutParams as UrlWithParams
}

function parseHeadersObject(obj: { [key: string]: string | string[] | undefined }){
    const newObj: { [key: string]: string | string[] | undefined } = {}
    for(const key in obj)
        newObj[key.toLowerCase()] = obj[key]
    return newObj
}

function parseAcceptHeader(content: string): ReadonlySet<[string, number]> {
    return new Set(content
        .split(",")
        .map(it => it.trim())
        .map(it => {
            const [code, q = "1"] = it.split(";q=")
            return [code, parseFloat(q)] as [string, number]
        }))
}

function parseCookieHeader(content: string): ReadonlyMap<string, string> {
    const map = new Map()

    const cookieList = content
        .split(";")
        .map(it => it.trim())
        .map(it => it.split("=", 2))

    for(const [key, value] of cookieList)
        map.set(key, value)

    return map
}

export class HttpRequest implements HttpRequestInf {
    public readonly url: UrlWithParams = parseUrl(this.request.url ?? "")
    public readonly method: string = (this.request.method ?? "GET").toUpperCase()

    public readonly headers: ReadonlyMap<string, string | string[]> = Maps.rewriteObjectAsMap(parseHeadersObject(this.request.headers))

    public readonly dataSaverEnabled = this.headers.has("save-data") ? this.headers.get("save-data") === "on" : null
    public readonly doNotTrackEnabled = this.headers.has("dnt") ? this.headers.get("dnt") === "1" : null

    public readonly referer = this.headers.has("referer") ? parse(this.headers.get("referer") as string, true) : null
    public readonly userAgent = (this.headers.get("user-agent") ?? null) as string | null

    public readonly acceptedContentTypes = parseAcceptHeader(this.headers.get("accept") as string)
    public readonly acceptedLanguages = parseAcceptHeader(this.headers.get("accept-language") as string)
    public readonly acceptedContentEncodings = parseAcceptHeader(this.headers.get("accept-encoding") as string) as ReadonlySet<[ContentEncoding | "*", number]>
    public readonly acceptedContentCharsets = parseAcceptHeader(this.headers.get("accept-charset") as string)

    public readonly cookies = parseCookieHeader(this.headers.get("cookie") as string ?? "")

    private readonly _body = new Lazy(() => new StreamToPromise(this.request).getResult())

    public get body(): Promise<string | null> {
        return this._body.value
    }

    public readonly customSettings = new Map()

    constructor(protected readonly request: Http2ServerRequest | Http1ServerRequest){}
}
