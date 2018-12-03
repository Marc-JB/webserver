import express, { Express, IRouter, Request } from "express"
import bodyParser from "body-parser"
import { HttpErrors } from "@peregrine/exceptions"
import net from "net"
import Endpoint from "./Endpoint";
import Controller from "./Controller"
import OK from "./status/OK";
import Created from "./status/Created";
import NoContent from "./status/NoContent";

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

    public addController<T extends object>(controller: Controller<T>, apiVersion: number = 1){
        const endpoint = new Endpoint()
        endpoint.get(`/${controller.resourceName}/`, async (request) => new OK(await controller.getAll(request.query)))
        endpoint.get(`/${controller.resourceName}/:id`, async (request) => new OK(await controller.get(parseInt(request.params.id.toString()), request.query)))
        endpoint.post(`/${controller.resourceName}/`, async (request) => new Created(await controller.create(request.body, request.query)))
        endpoint.put(`/${controller.resourceName}/`, async (request) => {
            await controller.updateAll(request.body, request.params)
            return new NoContent()
        })
        endpoint.put(`/${controller.resourceName}/:id`, async (request) => {
            await controller.update(parseInt(request.params.id.toString()), request.body, request.params)
            return new NoContent()
        })
        endpoint.delete(`/${controller.resourceName}/`, async (request) => {
            await controller.deleteAll(request.params)
            return new NoContent()
        })
        endpoint.delete(`/${controller.resourceName}/:id`, async (request) => {
            await controller.delete(parseInt(request.params.id.toString()), request.params)
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

    public start(port: number = 8080, customServer: Http | null = null, certificateOptions: CertificateOptions | null = null){
        this.addNotFoundErrorHandler()
        this.addErrorHandler()
        var server = customServer ? certificateOptions && customServer.createSecureServer ? customServer.createSecureServer(certificateOptions, this.express) : customServer.createServer(this.express) : this.express
        server.listen(port, () => {
            console.log(`Server running on port ${port}`)
        })
    }

    private static getDefaultExpressInstance(): Express {
        return express()
    }
}