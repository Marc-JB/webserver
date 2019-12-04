import url from "url"
import { Http2ServerRequest } from "http2"

enum HttpBodyReadState {
    NOT_STARTED, READING, DONE
}

export class HttpBodyStreamWrapper {
    protected state = HttpBodyReadState.NOT_STARTED
    protected queue: Set<() => void> = new Set()
    protected result: string | null = null

    constructor (protected readonly request: Http2ServerRequest) {}

    protected async readStream(): Promise<void> {
        let incomingData = ""
        let chunksRead = 0
        this.state = HttpBodyReadState.READING
        for await(const chunk of this.request){
            incomingData += chunk
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

export class HttpRequest {
    // public parsedBody = this.bodyReader.getBody()
    protected routeParams: {[key: string]: string} = {}

    /**
     * An authentication object
     * Defaults to *null*, add an authentication middleware to change the value
     */
    public authentication: any = null

    /**
     * Options passed trough by middleware.
     */
    public options: {[key: string]: any} = {}

    constructor(protected readonly request: Http2ServerRequest, protected readonly bodyReader = new HttpBodyStreamWrapper(request)){}

    public copy(): HttpRequest {
        const copy = new HttpRequest(this.request, this.bodyReader)

        copy.authentication = this.authentication
        copy.options = this.options

        return copy
    }

    /**
     * The headers that were passsed with the request
     */
    public get headers(): {[header: string]: string | string[] | undefined}{
        return this.request.headers
    }

    /**
     * The HTTP method of this request
     */
    public get method(): string {
        return this.request.method as string
    }

    /**
     * The url of this request
     */
    public get url(): string {
        return this.request.url as string
    }

    /**
     * The body of this request as a Promise
     */
    public get body(): Promise<string | null> {
        return this.bodyReader.getBody()
    }

    public set params(value: {[name: string]: string}) {
        this.routeParams = value
    }

    /**
     * The URL params
     */
    public get params(){
        return this.routeParams
    }

    /**
     * The query params of this request
     */
    public get query(): { [key: string]: string | string[] } {
        const { query } = url.parse(this.request.url as string, true)
        return query
    }
}
