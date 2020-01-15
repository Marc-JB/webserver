import { suite, test, expect } from "../../lib/test/index"
import { Endpoint, ResponseBuilder } from "../main/index"
import { Http2ServerRequest } from "http2"
import { HttpRequestImpl } from "../main/request/HttpRequestImpl"
import { Maps } from "../main/lib"

export function createFakeHttpRequest(
    url: { scheme: "http" | "https", domain: string, path: string },
    method: string,
    body: string | null = null,
    additionalHeaders: Map<string, string> = new Map()
): Http2ServerRequest {
    additionalHeaders.set(":scheme", url.scheme)
    additionalHeaders.set(":authority", url.domain)
    return {
        url: url.path,
        method: method,
        headers: Maps.rewriteMapAsObject(additionalHeaders),
        [Symbol.asyncIterator](): AsyncIterableIterator<string> {
            return (async function*() { if(body) yield body })()
        }
    } as Http2ServerRequest
}

@suite
export class EndpointTests {
    @test
    async createEndpointAtPathShouldAttachEndpointToRightPath() {
        // Arrange
        const endpoint1 = new Endpoint("/resource/")

        // Act
        const endpoint2 = endpoint1.createEndpointAtPath("/subresource/")

        // Assert
        expect(endpoint1.fullPath).to.equal("resource")
        expect(endpoint2.fullPath).to.equal("resource/subresource")
    }

    @test
    async getHandlerShouldBeCalledWithCorrectPathAndMethod() {
        // Arrange
        const endpoint = new Endpoint("/")
        let getCalled = false
        endpoint.get("/", _ => {
            getCalled = true
            return new ResponseBuilder().build()
        })
        const fakeRequest = createFakeHttpRequest({scheme: "https", domain: "localhost", path: "/"}, "GET")

        // Act
        endpoint.onRequest(fakeRequest.url.split("/").filter(it => it !== "").join("/"), new HttpRequestImpl(fakeRequest))

        // Assert
        expect(getCalled).to.be.true
    }

    @test
    async getHandlerShouldntBeCalledWithPostRequest() {
        // Arrange
        const endpoint = new Endpoint("/")
        let getCalled = false
        endpoint.get("/", _ => {
            getCalled = true
            return new ResponseBuilder().build()
        })
        const fakeRequest = createFakeHttpRequest({scheme: "https", domain: "localhost", path: "/"}, "POST")

        // Act
        endpoint.onRequest(fakeRequest.url.split("/").filter(it => it !== "").join("/"), new HttpRequestImpl(fakeRequest))

        // Assert
        expect(getCalled).to.be.false
    }

    @test
    async getHandlerShouldntBeCalledWithWrongPath() {
        // Arrange
        const endpoint = new Endpoint("/")
        let getCalled = false
        endpoint.get("/", _ => {
            getCalled = true
            return new ResponseBuilder().build()
        })
        const fakeRequest = createFakeHttpRequest({scheme: "https", domain: "localhost", path: "/something"}, "GET")

        // Act
        endpoint.onRequest(fakeRequest.url.split("/").filter(it => it !== "").join("/"), new HttpRequestImpl(fakeRequest))

        // Assert
        expect(getCalled).to.be.false
    }

    @test
    async handlerShouldCorrectlyResolveParamsAndQuery() {
        // Arrange
        const endpoint = new Endpoint("/")
        let param: string | null = null
        let query: string | null = null
        endpoint.get("/books/{id}/authors.json", request => {
            param = request.url.params.get("id") ?? null
            query = request.url.query.get("lang") as string ?? null
            return new ResponseBuilder().build()
        })
        const fakeRequest = createFakeHttpRequest({scheme: "https", domain: "localhost", path: "/books/1234/authors.json?lang=nl"}, "GET")

        // Act
        endpoint.onRequest(fakeRequest.url.split("/").filter(it => it !== "").join("/"), new HttpRequestImpl(fakeRequest))

        // Assert
        expect(param).to.equal("1234")
        expect(query).to.equal("nl")
    }
}
