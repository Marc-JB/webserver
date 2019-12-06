import { Http2Server } from "http2"
import { Endpoint, ResponseObjectType } from "./Endpoint";
import { HttpRequest } from "./HttpRequest"
import { EndpointParent } from "./EndpointParent";
import { rewriteMapAsObject } from "./Utils";

export class Server implements EndpointParent {
    public fullPath: string = ""

    public readonly childEndpoints: Set<Endpoint> = new Set()

    protected readonly _instances: Set<string | number> = new Set()

    public get instances(): ReadonlySet<string | number> {
        return new Set(this._instances)
    }

    constructor(protected readonly server: Http2Server) {
        server.on("request", async (req, res) => {
            const request = new HttpRequest(req)
            const url = (req.url as string).split("/").filter(it => it !== "").join("/")

            let responseObject: ResponseObjectType | null = null

            // Loop trough child endpoints to check if they have a reponse ready
            for(const endpoint of this.childEndpoints) {
                if(url.startsWith(endpoint.fullPath)) {
                    const r = await endpoint.onRequest(url, request)
                    if(r !== null) {
                        if(responseObject !== null) {
                            throw new Error(`${url} is registered on 2 different endpoints!`)
                        }
                        responseObject = r
                    }
                }
            }

            if(responseObject === null) {
                res.writeHead(404)
                res.end()
            } else {
                if("code" !in responseObject) {
                    throw new Error("Invalid response, response doesn't contain HTTP status code")
                }
                if("body" !in responseObject || typeof responseObject.body !== "string") {
                    throw new Error("Invalid response, response doesn't contain HTTP a plaintext body")
                }

                res.writeHead(responseObject.code, responseObject.headers !== undefined ? rewriteMapAsObject(responseObject.headers) : undefined)
                res.end(responseObject.body)
            }
        })
    }

    public async connect(portOrPath: number | string): Promise<void> {
        await new Promise((resolve, reject) => {
            this.server.once("error", (error: Error) => reject(error))
            this.server.listen(portOrPath, () => resolve())
        })
        this._instances.add(portOrPath)
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
}
