import { Http2ServerRequest } from "http2"
import { Readable as ReadableStream } from "stream"
import { parse as parseUrl, UrlWithParsedQuery } from "url"
import { HttpRequestInf, HttpRequestInfCore, HttpRequestInfWithParams, HttpRequestInfWithParamsInternal } from "./HttpRequestInf"
import { Maps, Lazy } from "../../lib/main/index"

enum HttpBodyReadState {
    NOT_STARTED, READING, DONE
}

class HttpBodyStreamWrapper {
    protected state = HttpBodyReadState.NOT_STARTED
    protected queue: Set<() => void> = new Set()
    protected result: string | null = null

    constructor (protected readonly request: ReadableStream) {}

    protected async readStream(): Promise<void> {
        let incomingData = ""
        let chunksRead = 0
        this.state = HttpBodyReadState.READING
        for await(const chunk of this.request){
            incomingData += chunk as string
            chunksRead++
        }
        this.result = chunksRead === 0 ? null : incomingData
        this.state = HttpBodyReadState.DONE
        for(const promise of this.queue) {
            promise()
        }
        this.queue.clear()
    }

    public async getBody(): Promise<string | null> {
        if (this.state === HttpBodyReadState.NOT_STARTED){
            await this.readStream()
        } else if (this.state === HttpBodyReadState.READING){
            await new Promise(resolve => { this.queue.add(resolve) })
        }

        return this.result
    }
}

export class HttpRequestCore implements HttpRequestInfCore {
    public readonly url: UrlWithParsedQuery = parseUrl(this.request.url, true)
    public readonly method: string = this.request.method.toUpperCase()
    public readonly headers: ReadonlyMap<string, string | string[]> = Maps.rewriteObjectAsMap(this.request.headers)

    private readonly _body: Lazy<Promise<string | null>> = new Lazy(() => this.bodyReader.getBody())

    public get body(): Promise<string | null> {
        return this._body.value
    }

    constructor(
        protected readonly request: Http2ServerRequest,
        protected readonly bodyReader = new HttpBodyStreamWrapper(request)
    ){}
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
