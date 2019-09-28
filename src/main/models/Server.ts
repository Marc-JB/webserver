import { File } from "@peregrine/filesystem"
import { TlsOptions } from "tls"
import net from "net"
import { Endpoint, http, Request, Response, HttpRequest, HttpResponse, HttpModule, StringUtils, PortInUseException } from "../index"

class RootEndpoint extends Endpoint {
    constructor() {
        super("")
    }

    public async _onRequest(url: string, request: Request, response: Response){
        this.onRequest(url, request, response);
    }
}

export class Server {
    protected rootEndpoint = new RootEndpoint()
    protected instances: { server: net.Server, port: number | string, onConnectedListener?: (connectionInfo: {port: number}) => void }[] = []

    constructor() {}
    
    protected onServerRequest(request: HttpRequest, response: HttpResponse){
        this.rootEndpoint._onRequest(StringUtils.removeEnds(request.url as string, "/"), new Request(request), new Response(response))
    }

    /**
     * Starts the server on the specified or default port with the configured security options
     * @param key the key, a file pointing to the key or a Buffer containing the key
     * @param cert the certificate, a file pointing to the certificate or a Buffer containing the certificate
     * @param port the port where the server will start listening to
     * @param createServer a function that takes certificate options and returns an HTTP server
     */
    public async start(key: string | File | Buffer, cert: string | File | Buffer, port: number | string = 443, createServer: http.SecuredHttpModule = HttpModule.Http2): Promise<{ port: number | string }> {
        const server = createServer(await Server.createCertOptions(key, cert), (request, response) => this.onServerRequest(request, response))
        try {
            await Server.listen(server, port)
        } catch (error) {
            throw new PortInUseException(port)
        }
        this.instances.push({server, port})
        return {port}
    }

    /**
     * Starts the server on the specified or default port, with no security
     * @param port the port where the server will start listening to
     * @param createServer a function that returns an HTTP server
     */
    public async startWithoutSecurity(port: number | string = 80, createServer: http.UnsecuredHttpModule = HttpModule.Http1): Promise<{ port: number | string }> {
        const server = createServer((request, response) => this.onServerRequest(request, response))
        try {
            await Server.listen(server, port)
        } catch (error) {
            throw new PortInUseException(port)
        }
        this.instances.push({server, port})
        return { port }
    }
    
    /**
     * @returns the root endpoint
     */
    public get root(): Endpoint {
        return this.rootEndpoint;
    }

    protected static listen(server: net.Server, port: number | string){
        return new Promise((resolve, reject) => {
            server.once("error", e => reject(e))
            server.listen(port, () => resolve())
        })
    }

    public static async createCertOptions(key: string | File | Buffer, cert: string | File | Buffer): Promise<TlsOptions> {
        return {
            key: key instanceof File ? await key.readContent() : key,
            cert: cert instanceof File ? await cert.readContent() : cert
        }
    }
}