import stream from "stream"
import url from "url"
import { Json } from "../index"

export type HttpRequest = { 
    headers: {[header: string]: string | string[] | undefined}, 
    method?: string, 
    url?: string
} & stream.Readable

export class Request {
    protected routeParams: {[key: string]: string} = {}
    protected incomingData: string = ""
    protected allDataReceived: boolean = false
    protected dataCallbacks: ((data: string) => void)[] = []

    /**
     * An authentication object
     * Defaults to *null*, add an authentication middleware to change the value
     */
    public authentication: any = null
    /**
     * Options passed trough by middleware.
     */
    public options: {[key: string]: any} = {}

    constructor(protected readonly request: HttpRequest){
        request.on("data", chunk => {
            this.incomingData += chunk
        })

        request.on("end", () => {
            this.allDataReceived = true
            this.dataCallbacks.forEach(callback => callback(this.incomingData))
        })
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
     * Will be parsed to json if the header "content-type" is "application/json"
     */
    public get body(): Promise<string | Json> {
        return new Promise((resolve, reject) => {
            if(!this.allDataReceived) this.dataCallbacks.push((body) => resolve(this.parseBody(body)))
            else resolve(this.parseBody(this.incomingData))
        })
    }

    protected parseBody(body: string){
        const contentType = this.request.headers["content-type"]
        return contentType && typeof contentType == "string" && contentType.startsWith("application/json") ? JSON.parse(body) : body
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