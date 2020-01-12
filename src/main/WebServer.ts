import { Http2Server, Http2ServerRequest, Http2ServerResponse } from "http2"
import { IncomingMessage as Http1ServerRequest, Server as Http1Server, ServerResponse as Http1ServerResponse } from "http"
import { Server as Https1Server } from "https"
import { Endpoint } from "./Endpoint"
import { EndpointParent, requestCheckOnChildEndpoint } from "./EndpointParent"
import { HttpRequestImpl } from "./request/HttpRequestImpl"
import { Maps } from "../../lib/main/index"
import { WebServerBuilder } from "./WebServerBuilder"
import { ResponseBuilder } from "./response/ResponseBuilder"
import { PageBuilder } from "./response/PageBuilder"
import { ReadonlyResponseInf, ResponseInf } from "./response/ResponseInf"
import { HttpRequest } from "./request/HttpRequest"

export enum CONNECTION_TYPE {
    HTTP1, HTTPS1, HTTP2, HTTPS2_WITH_HTTP1_FALLBACK, HTTPS2
}

export class WebServer implements EndpointParent {
    /**
     * The path this server is connected to. Always empty, since the server is the root.
     */
    public readonly fullPath: string = ""

    /**
     * All endpoints that are connected to this server instance.
     */
    public readonly childEndpoints: Set<Endpoint> = new Set()

    protected isListening = false

    public get listening() {
        return this.isListening
    }

    public readonly isHTTPS = this.connectionType !== CONNECTION_TYPE.HTTP1 && this.connectionType !== CONNECTION_TYPE.HTTP2

    constructor(
        protected readonly server: Http2Server | Http1Server | Https1Server,
        public readonly port: string | number,
        public readonly connectionType: CONNECTION_TYPE,
        protected readonly developmentMessagesEnabled: boolean = false
    ) {
        server.on("request", (req, res) => this.onHttpRequest(req, res))
    }

    public async onRequest(url: string, request: HttpRequest): Promise<ReadonlyResponseInf | ResponseInf | null> {
        return requestCheckOnChildEndpoint(this, url, request)
    }

    private async onHttpRequest(req: Http2ServerRequest | Http1ServerRequest, res: Http2ServerResponse | Http1ServerResponse) {
        try {
            const url = (req.url as string).split("/").filter(it => it !== "").join("/")
            const responseObject = await this.onRequest(url, new HttpRequestImpl(req))
            await this.writeResponse(responseObject ?? new ResponseBuilder().setStatusCode(404).setHtmlBody(PageBuilder.createPage("Page not Found")).build(), res)
        } catch (error) {
            console.error(error)

            const response = new ResponseBuilder()
                .setStatusCode(500)
                .setHtmlBody(PageBuilder.createPage("Internal Server Error", this.developmentMessagesEnabled && error instanceof Error ? PageBuilder.createCodeBlock("Stack trace", error.stack ?? "No stack trace found") : "<p>Please try again later</p>", "red", "cyan"))
                .build()

            await this.writeResponse(response, res)
        }
    }

    private writeResponse(responseObject: ReadonlyResponseInf, res: Http2ServerResponse | Http1ServerResponse): Promise<void> {
        res.writeHead(responseObject.code, Maps.rewriteMapAsObject(responseObject.headers))

        if(responseObject.body === null)
            return new Promise(resolve => res.end(() => resolve()))
        else
            return new Promise(resolve => res.end(responseObject.body as string, () => resolve()))
    }

    /**
     * Makes the server start listening for requests
     */
    public listen(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.once("error", (error: Error) => reject(error))
            this.server.listen(this.port, () => {
                this.isListening = true
                resolve()
            })
        })
    }

    /**
     * Makes the server stop listening for requests
     */
    public close() {
        return this.isListening ? new Promise<void>((resolve, reject) => {
            this.server.close(error => error ? reject(error) : resolve())
        }) : Promise.resolve()
    }

    /**
     * Creates a new endpoint and attaches it to this endpoint on the given route
     * @param route The route to register the endpoint on
     * @returns the new endpoint that was created
     */
    public createEndpointAtPath(route: string): Endpoint {
        const endpoint = new Endpoint(route, this)
        this.childEndpoints.add(endpoint)
        return endpoint
    }

    static get Builder(): typeof WebServerBuilder {
        return WebServerBuilder
    }

    public toJSON() {
        return {
            port: this.port,
            isHTTPS: this.isHTTPS,
            children: Array.from(this.childEndpoints).map(it => it.toJSON())
        }
    }
}
