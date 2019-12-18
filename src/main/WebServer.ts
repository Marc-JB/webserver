import { Http2Server, Http2ServerRequest, Http2ServerResponse } from "http2"
import { Endpoint, ReadonlyResponseInf } from "./Endpoint"
import { EndpointParent } from "./EndpointParentInf"
import { HttpRequest } from "./HttpRequest"
import { Maps } from "../../lib/main/index"
import { WebServerBuilder } from "./WebServerBuilder"
import { ResponseBuilder } from "./ResponseBuilder"

export class WebServer implements EndpointParent {
    public readonly fullPath: string = ""

    public readonly childEndpoints: Set<Endpoint> = new Set()

    protected readonly _instances: Set<string | number> = new Set()

    public get instances(): ReadonlySet<string | number> {
        return new Set(this._instances)
    }

    constructor(protected readonly server: Http2Server, protected readonly developmentMessagesEnabled: boolean = false) {
        server.on("request", (req, res) => this.onRequest(req, res))
    }

    private async onRequest(req: Http2ServerRequest, res: Http2ServerResponse) {
        try {
            const request = new HttpRequest(req)
            const url = (req.url as string).split("/").filter(it => it !== "").join("/")

            let responseObject: ReadonlyResponseInf | null = null

            // Loop trough child endpoints to check if they have a reponse ready
            for(const endpoint of this.childEndpoints) {
                if(url.startsWith(endpoint.fullPath)) {
                    const r = await endpoint.onRequest(url, request)
                    if(r !== null) {
                        if(responseObject !== null)
                            throw new Error(`${url} is registered on 2 different endpoints!`)

                        responseObject = r
                    }
                }
            }

            await this.writeResponse(responseObject ?? new ResponseBuilder().setStatus(404).build(), res)
        } catch (error) {
            console.error(error)

            const response = new ResponseBuilder()
                .setStatus(500)
                .setBody(this.developmentMessagesEnabled ? JSON.stringify(error) : null)
                .build()

            await this.writeResponse(response, res)
        }
    }

    private writeResponse(responseObject: ReadonlyResponseInf, res: Http2ServerResponse): Promise<void> {
        res.writeHead(responseObject.code, Maps.rewriteMapAsObject(responseObject.headers))

        if(responseObject.body === null)
            return new Promise(resolve => res.end(() => resolve()))
        else
            return new Promise(resolve => res.end(responseObject.body as string, () => resolve()))
    }

    public async connect(portOrPath: number | string): Promise<void> {
        await this.listen(portOrPath)
        this._instances.add(portOrPath)
    }

    private listen(portOrPath: number | string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.once("error", (error: Error) => reject(error))
            this.server.listen(portOrPath, () => resolve())
        })
    }

    public close() {
        return new Promise((resolve, reject) => {
            if(this._instances.size > 0) this.server.close(error => error ? reject(error) : resolve())
            else resolve()
        })
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
}
