import { Http2Server, Http2ServerRequest, Http2ServerResponse } from "http2"
import { Endpoint, ResponseObjectType } from "./Endpoint"
import { EndpointParent } from "./EndpointParentInf"
import { HttpRequest } from "./HttpRequest"
import { Maps } from "../../lib/main/index"
import { WebServerBuilder } from "./WebServerBuilder"

export class WebServer implements EndpointParent {
    public readonly fullPath: string = ""

    public readonly childEndpoints: Set<Endpoint> = new Set()

    protected readonly _instances: Set<string | number> = new Set()

    public get instances(): ReadonlySet<string | number> {
        return new Set(this._instances)
    }

    constructor(protected readonly server: Http2Server, protected readonly developmentMessagesEnabled: boolean = false) {
        server.on("request", async (req, res) => this.onRequest(req, res))
    }

    private async onRequest(req: Http2ServerRequest, res: Http2ServerResponse) {
        try {
            const request = new HttpRequest(req)
            const url = (req.url as string).split("/").filter(it => it !== "").join("/")

            let responseObject: ResponseObjectType | null = null

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

            this.writeResponse(responseObject, res)
        } catch (error) {
            this.writeResponse({
                code: 500,
                body: this.developmentMessagesEnabled ? JSON.stringify(error) : null
            }, res)

            console.error(error)
        }
    }

    private writeResponse(responseObject: ResponseObjectType | null, res: Http2ServerResponse): Promise<void> {
        if(responseObject === null) {
            res.writeHead(404)
            return new Promise(resolve => res.end(() => resolve()))
        } else {
            if(!("code" in responseObject))
                throw new Error("Invalid response, response doesn't contain HTTP status code")

            if(!("body" in responseObject) || (typeof responseObject.body !== "string" && responseObject.body !== null))
                throw new Error("Invalid response, response doesn't contain a plaintext body")

            res.writeHead(responseObject.code, responseObject.headers !== undefined ? Maps.rewriteMapAsObject(responseObject.headers) : undefined)

            if(responseObject.body === null)
                return new Promise(resolve => res.end(() => resolve()))
            else
                return new Promise(resolve => res.end(responseObject.body, () => resolve()))
        }
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
