import { promises as fs } from "fs"
import http2, { Http2Server } from "http2"
import { Endpoint, ResponseObjectType } from "./Endpoint";
import { HttpRequest } from "./HttpRequest"
import { EndpointParent } from "./Types";

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
                    const r = await endpoint.onRequest(url, request.copy())
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

                const headerObj: {[key: string]: string | number | string[]} = {}

                if(responseObject.headers) {
                    for(const header of responseObject.headers) {
                        headerObj[header[0]] = header[1]
                    }
                }

                res.writeHead(responseObject.code, headerObj)
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

type CertificateType = string | Buffer | fs.FileHandle

function isFileHandle(cert: CertificateType | null): cert is fs.FileHandle {
    return cert !== null && typeof cert !== "string" && "readFile" in cert
}

export class WebServerBuilder {
    protected cert: CertificateType | null = null
    protected key: CertificateType | null = null

    getCert(): CertificateType | null {
        return this.cert
    }

    setCert(cert: CertificateType): this {
        this.cert = cert
        return this
    }

    getKey(): CertificateType | null {
        return this.key
    }

    setKey(key: CertificateType): this {
        this.key = key
        return this
    }

    async build(): Promise<Server> {
        let cert: string | Buffer | null = null
        let key: string | Buffer | null = null

        const p = []

        if(isFileHandle(this.cert)){
            const fileHandle = this.cert
            p.push(async () => {
                cert = await fileHandle.readFile()
                await fileHandle.close()
            })
        } else {
            cert = this.cert
        }

        if(isFileHandle(this.key)){
            const fileHandle = this.key
            p.push(async () => {
                key = await fileHandle.readFile()
                await fileHandle.close()
            })
        } else {
            key = this.key
        }

        await Promise.all(p)

        if(cert === null && key === null) {
            return new Server(http2.createServer())
        } else if (cert !== null && key !== null) {
            return new Server(http2.createSecureServer({ allowHTTP1: true, cert, key }))
        } else {
            throw new Error("Key and cert must be both set or unset")
        }
    }
}
