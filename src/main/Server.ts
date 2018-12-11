import express, { Express } from "express"
import bodyParser from "body-parser"
import { HttpErrors } from "@peregrine/exceptions"
import net from "net"
import Endpoint from "./Endpoint";
import Controller from "./Controller"
import OK from "./status/OK";
import Created from "./status/Created";
import NoContent from "./status/NoContent";
import AuthHandler from "./AuthHandler";

type Http = { 
    createServer: (app?: any) => net.Server,
    createSecureServer?: (options?: object, app?: any) => net.Server
}

type CertificateOptions = {
    key?: any, 
    cert?: any
}

export default class Server extends Endpoint {
    constructor(protected readonly express: Express = Server.getDefaultExpressInstance()){
        super(express)

        this.express.use(bodyParser.urlencoded({ extended: true }))
        this.express.use(bodyParser.json())
        this.express.use(bodyParser.json({ type: 'application/vnd.api+json' }))
    }

    /**
     * Adds the controller to the server.
     * @param controller The controller to add
     * @param authHandler (optional) a class that handles the authentication.
     * @param apiVersion The version of the API. This will be part of the url (/api/v1/, /api/v2/, ...)
     */
    public addController<T extends object, A = any>(controller: Controller<T, A>, authHandler?: AuthHandler<A>, apiVersion: number = 1){
        const endpoint = new Endpoint()
        endpoint.get(`/${controller.resourceName}/`, async (request) => {
            if(!controller.getAll) throw new HttpErrors.Client.NotFound()
            return new OK(await controller.getAll(request.query, authHandler ? await authHandler.getAuth(request) : undefined))
        })
        endpoint.get(`/${controller.resourceName}/:id`, async (request) => {
            if(!controller.get) throw new HttpErrors.Client.NotFound()
            return new OK(await controller.get(request.params.id, request.query, authHandler ? await authHandler.getAuth(request) : undefined))
        })
        endpoint.post(`/${controller.resourceName}/`, async (request) => {
            if(!controller.create) throw new HttpErrors.Client.NotFound()
            return new Created(await controller.create(request.body, request.query, authHandler ? await authHandler.getAuth(request) : undefined))
        })
        endpoint.put(`/${controller.resourceName}/`, async (request) => {
            if(!controller.updateAll) throw new HttpErrors.Client.NotFound()
            await controller.updateAll(request.body, request.params, authHandler ? await authHandler.getAuth(request) : undefined)
            return new NoContent()
        })
        endpoint.put(`/${controller.resourceName}/:id`, async (request) => {
            if(!controller.update) throw new HttpErrors.Client.NotFound()
            await controller.update(request.params.id, request.body, request.params, authHandler ? await authHandler.getAuth(request) : undefined)
            return new NoContent()
        })
        endpoint.delete(`/${controller.resourceName}/`, async (request) => {
            if(!controller.deleteAll) throw new HttpErrors.Client.NotFound()
            await controller.deleteAll(request.params, authHandler ? await authHandler.getAuth(request) : undefined)
            return new NoContent()
        })
        endpoint.delete(`/${controller.resourceName}/:id`, async (request) => {
            if(!controller.delete) throw new HttpErrors.Client.NotFound()
            await controller.delete(request.params.id, request.params, authHandler ? await authHandler.getAuth(request) : undefined)
            return new NoContent()
        })
        this.addApiEndpoint(endpoint, apiVersion)
    }

    public addApiEndpoint(endpoint: Endpoint, apiVersion: number = 1){
        this.addEndpoint(`/api/v${apiVersion}/`, endpoint)
    }

    protected addNotFoundErrorHandler(){
        this.express.use('*', (req, res, next) => next(new HttpErrors.Client.NotFound('Endpoint does not exist')))
    }

    protected addErrorHandler(){
        this.express.use(((err, req, res, next) => res.status(err.code || 500).json(err)) as express.ErrorRequestHandler)
    }

    public start(port: number = 8080, customServer: Http | null = null, certificateOptions: CertificateOptions | null = null): Promise<{port: number}> {
        this.addNotFoundErrorHandler()
        this.addErrorHandler()
        return new Promise((resolve, reject) => {
            const server = customServer ? certificateOptions && customServer.createSecureServer ? customServer.createSecureServer(certificateOptions, this.express) : customServer.createServer(this.express) : this.express
            server.listen(port, () => resolve({port}))
        })
    }

    private static getDefaultExpressInstance(): Express {
        return express()
    }
}