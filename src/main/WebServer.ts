import { Http2Server, Http2ServerRequest, Http2ServerResponse } from "http2"
import { IncomingMessage as Http1ServerRequest, Server as Http1Server, ServerResponse as Http1ServerResponse } from "http"
import { Server as Https1Server } from "https"
import { Endpoint } from "./Endpoint"
import { HttpRequestImpl } from "./request/HttpRequestImpl"
import { Maps, Json, JSObject, Lazy } from "../../lib/main/index"
import { WebServerBuilder } from "./WebServerBuilder"
import { ResponseBuilder } from "./response/ResponseBuilder"
import { PageBuilder } from "./response/PageBuilder"
import { ReadonlyResponseInf } from "./response/ResponseInf"

export enum CONNECTION_TYPE {
    HTTP1, HTTPS1, HTTP2, HTTPS2_WITH_HTTP1_FALLBACK, HTTPS2
}

export class WebServer implements JSObject {
    public readonly root = new Endpoint("")

    protected static readonly notFoundPage = new Lazy(() => new ResponseBuilder().setStatusCode(404).setHtmlBody(PageBuilder.createPage("Page not Found")).build())
    protected static readonly internalServerErrorPageBody = new Lazy(() => PageBuilder.createPage("Internal Server Error", "${error}", "red", "cyan"))

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

    private getInternalErrorPage(error: any) {
        const displayStackTrace = this.developmentMessagesEnabled && error instanceof Error
        return WebServer.internalServerErrorPageBody.value.replace("${error}", displayStackTrace ?
            PageBuilder.createCodeBlock("Stack trace", error.stack ?? "No stack trace found") :
            "<p>Please try again later</p>"
        )
    }

    private async onHttpRequest(req: Http2ServerRequest | Http1ServerRequest, res: Http2ServerResponse | Http1ServerResponse) {
        let responseObject: ReadonlyResponseInf

        try {
            responseObject = await this.root.onRequest(
                req.url?.split("/").filter(it => it !== "").join("/") ?? "",
                new HttpRequestImpl(req)
            ) ?? WebServer.notFoundPage.value
        } catch (error) {
            console.error(error)

            responseObject = new ResponseBuilder()
                .setStatusCode(500)
                .setHtmlBody(this.getInternalErrorPage(error))
                .build()
        }

        res.writeHead(responseObject.code, Maps.rewriteMapAsObject(responseObject.headers))

        await new Promise(resolve => responseObject.body === null ? res.end(resolve) : res.end(responseObject.body, resolve))
    }

    /** Makes the server start listening for requests */
    public listen(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.once("error", (error: Error) => reject(error))
            this.server.listen(this.port, () => {
                this.isListening = true
                resolve()
            })
        })
    }

    /** Makes the server stop listening for requests */
    public close() {
        return this.isListening ? new Promise<void>((resolve, reject) => {
            this.server.close(error => error ? reject(error) : resolve())
        }) : Promise.resolve()
    }

    static get Builder(): typeof WebServerBuilder {
        return WebServerBuilder
    }

    public toJSON(): Json {
        return {
            port: this.port,
            isHTTPS: this.isHTTPS,
            root: this.root.toJSON()
        }
    }
}
