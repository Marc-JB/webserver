import { File } from "@peregrine/filesystem"
import { TlsOptions } from "tls"
import net from "net"
import { Endpoint, http, Request, Response, HttpRequest, HttpResponse, HttpModule, StringUtils, PortInUseException } from ".."

export class Server extends Endpoint {
    protected instances: { server: net.Server, port: number, onConnectedListener?: (connectionInfo: {port: number}) => void }[] = []

    constructor(){
        super("")
    }
    
    protected onServerRequest(request: HttpRequest, response: HttpResponse){
        this.onRequest(StringUtils.removeEnds(request.url as string, "/"), new Request(request), new Response(response))
    }

    /**
     * Starts the server on the specified or default port with the configured security options
     * @param key the key, a file pointing to the key or a Buffer containing the key
     * @param cert the certificate, a file pointing to the certificate or a Buffer containing the certificate
     * @param port the port where the server will start listening to
     * @param createServer a function that takes certificate options and returns an HTTP server
     */
    public async start(key: string | File | Buffer, cert: string | File | Buffer, port: number = 443, createServer: http.SecuredHttpModule = HttpModule.Http2): Promise<{ port: number }> {
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
    public async startWithoutSecurity(port: number = 80, createServer: http.UnsecuredHttpModule = HttpModule.Http1): Promise<{ port: number }> {
        const server = createServer((request, response) => this.onServerRequest(request, response))
        try {
            await Server.listen(server, port)
        } catch (error) {
            throw new PortInUseException(port)
        }
        this.instances.push({server, port})
        return {port}
    }

    protected static listen(server: net.Server, port: number){
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