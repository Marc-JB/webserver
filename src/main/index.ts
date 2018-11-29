import express, { Express } from "express"
import bodyParser from "body-parser"
import { HttpErrors } from "@peregrine/exceptions"
import net from "net"

type Http = { 
    createServer: (app?: any) => net.Server,
    createSecureServer?: (options?: object, app?: any) => net.Server
}

type CertificateOptions = {
    key?: any, 
    cert?: any
}

export default class Server {
    public express: Express

    constructor(){
        this.express = express()

        this.express.use(bodyParser.urlencoded({ extended: true }))
        this.express.use(bodyParser.json())
        this.express.use(bodyParser.json({ type: 'application/vnd.api+json' }))
    }

    /* public addController<T>(controller: IController<T>, apiVersion: number = 1){
        this.express.use(`api/v${apiVersion}/`, new Router<T>(controller).router)
    } */

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
}