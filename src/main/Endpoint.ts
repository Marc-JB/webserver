import express, { IRouter, Request, Response, NextFunction } from "express";
import IResponse from "./Response"

type PromiseLike<T> = T | Promise<T>

export default class Endpoint {
    constructor(protected readonly exprRouter: IRouter<any> = express.Router()){}

    public addEndpoint(url: string, endpoint: Endpoint){
        this.exprRouter.use(url, endpoint.exprRouter)
    }

    public get(path: string, f: (request: Request) => PromiseLike<IResponse>){
        this.exprRouter.get(path, Endpoint.getMapper(f))
    }

    public post(path: string, f: (request: Request) => PromiseLike<IResponse>){
        this.exprRouter.post(path, Endpoint.getMapper(f))
    }

    public put(path: string, f: (request: Request) => PromiseLike<IResponse>){
        this.exprRouter.put(path, Endpoint.getMapper(f))
    }

    public delete(path: string, f: (request: Request) => PromiseLike<IResponse>){
        this.exprRouter.delete(path, Endpoint.getMapper(f))
    }

    private static getMapper(f: (request: Request) => PromiseLike<IResponse>){
        return async (request: Request, response: Response, next: NextFunction) => {
            try {
                const responseModel = await f(request)
                const responseBuilder = response.status(responseModel.statusCode)
                if(responseModel.body) 
                    responseBuilder.json(responseModel.body)
                responseBuilder.end()
            } catch (error) {
                next(error)
            }
        }
    }
}