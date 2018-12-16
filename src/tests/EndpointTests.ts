import "mocha"
import * as chai from "chai"
import { Request, Response } from "express"
import Exception from "@peregrine/exceptions"
import TestEndpoint from "./models/TestEndpoint";
import FakeResponse from "./models/FakeResponse";

chai.should()

describe(`Endpoint`, () => {
    it(`Endpoint should catch errors when thrown and call next()`, async () => {
        const resultFunction = TestEndpoint.getMapperPublic(async () => { 
            throw new Exception("Exception") 
        })

        let nextCalled = 0
        const nextFunction = () => { nextCalled++ }
        
        await resultFunction({} as Request, new FakeResponse() as unknown as Response, nextFunction)

        chai.assert.isOk(nextCalled == 1, `Next function should be called once, was ${nextCalled} times`)
    })

    it(`Endpoint should succeed when no errors are thrown`, async () => {
        const resultFunction = TestEndpoint.getMapperPublic(async () => { 
            return { statusCode: 200, body: null }
        })

        let nextCalled = 0
        const nextFunction = () => { nextCalled++ }
        
        await resultFunction({} as Request, new FakeResponse() as unknown as Response, nextFunction)

        chai.assert.isOk(nextCalled == 0, `Next function shouldn't be called, was ${nextCalled} times`)
    })

    it(`Endpoint should send response without body to express correctly`, async () => {
        const testStatusCode = 200
        const resultFunction = TestEndpoint.getMapperPublic(async () => { 
            return { statusCode: testStatusCode, body: null }
        })

        const fakeResponse = new FakeResponse()

        let statusCalled = 0
        let statusCode: number | null = null
        fakeResponse.statusHandler = (code: number) => {
            statusCalled++
            statusCode = code
        }

        let jsonCalled = 0
        fakeResponse.jsonHandler = (body: any) => { jsonCalled++ }

        let endCalled = 0
        fakeResponse.endHandler = () => { endCalled++ }
        
        await resultFunction({} as Request, fakeResponse as unknown as Response, () => {})

        chai.assert.isOk(statusCalled == 1, `response.status function should be called once, was ${statusCalled} times`)
        chai.assert.isOk(testStatusCode === statusCode, `status code should be ${testStatusCode}, was ${statusCode}`)
        chai.assert.isOk(jsonCalled == 0, `response.json function shouldn't be called, was ${jsonCalled} times`)
        chai.assert.isOk(endCalled == 1, `response.end function should be called once, was ${endCalled} times`)
    })

    it(`Endpoint should send response with body to express correctly`, async () => {
        const testStatusCode = 200
        const testBody = {
            success: true,
            message: "Success", 
            status: {
                code: testStatusCode,
                name: "OK"
            }
        }

        const resultFunction = TestEndpoint.getMapperPublic(async () => { 
            return { statusCode: testStatusCode, body: testBody }
        })

        const fakeResponse = new FakeResponse()

        let statusCalled = 0
        let statusCode: number | null = null
        fakeResponse.statusHandler = (code: number) => {
            statusCalled++
            statusCode = code
        }

        let jsonCalled = 0
        let jsonBody: any = null
        fakeResponse.jsonHandler = (body: any) => { 
            jsonCalled++ 
            jsonBody = body
        }

        let endCalled = 0
        fakeResponse.endHandler = () => { endCalled++ }
        
        await resultFunction({} as Request, fakeResponse as unknown as Response, () => {})

        chai.assert.isOk(statusCalled == 1, `response.status function should be called once, was ${statusCalled} times`)
        chai.assert.isOk(testStatusCode === statusCode, `status code should be ${testStatusCode}, was ${statusCode}`)
        chai.assert.isOk(jsonCalled == 1, `response.json function should be called once, was ${jsonCalled} times`)
        chai.assert.isOk(testBody === jsonBody, `response body should be equal to body send`)
        chai.assert.isOk(endCalled == 1, `response.end function should be called once, was ${endCalled} times`)
    })
})