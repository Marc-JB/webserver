import "mocha"
import * as chai from "chai"
import { Request, Response } from "express"
import Endpoint from "../main/Endpoint"
import IResponse from "../main/Response"
import Exception from "@peregrine/exceptions"

chai.should()

type PromiseLike<T> = T | Promise<T>

class TestEndpoint extends Endpoint {
    public static getMapperPublic(f: (request: Request) => PromiseLike<IResponse>){
        return TestEndpoint.getMapper(f)
    }
}

const fakeResponse = { 
    status: () => { 
        return { 
            end: () => {}, 
            json: () => { 
                return { 
                    end: () => {} 
                } 
            } 
        } 
    } 
} as unknown as Response

describe(`Endpoint: Error management`, () => {
    it(`Endpoint should catch errors when thrown and call next()`, async () => {
        const resultFunction = TestEndpoint.getMapperPublic(async () => { 
            throw new Exception("Exception") 
        })

        let nextCalled = 0
        const nextFunction = () => { nextCalled++ }
        
        await resultFunction({} as Request, fakeResponse, nextFunction)

        chai.assert.isOk(nextCalled == 1, `Next function should be called once, was ${nextCalled} times`)
    })

    it(`Endpoint should succeed when no errors are thrown`, async () => {
        const resultFunction = TestEndpoint.getMapperPublic(async () => { 
            return { statusCode: 200, body: null }
        })

        let nextCalled = 0
        const nextFunction = () => { nextCalled++ }
        
        await resultFunction({} as Request, fakeResponse, nextFunction)

        chai.assert.isOk(nextCalled == 0, `Next function shouldn't be called, was ${nextCalled} times`)
    })
})