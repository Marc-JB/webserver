import { Request } from "express"
import { Endpoint, Response } from "../../main/index"

type PromiseLike<T> = T | Promise<T>

export default class TestEndpoint extends Endpoint {
    public static getMapperPublic(f: (request: Request) => PromiseLike<Response>){
        return TestEndpoint.getMapper(f)
    }
}