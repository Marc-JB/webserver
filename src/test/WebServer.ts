import { suite, test, expect } from "../../lib/test/index"
import { WebServer, ResponseBuilder } from "../main/index"
import { Http2ServerResponse } from "http2"
import { createFakeHttpRequest } from "./Endpoint"
import { Async } from "../main/lib"
import { MockCallback } from "../main/WebServerBuilder"

@suite
export class WebServerTests {
    @test
    async connectShouldThrowErrorWhenPortIsInUse(){
        // Arrange
        const server1 = await new WebServer.Builder().enableDevelopmentMessages().setPort(8080).build()
        const server2 = await new WebServer.Builder().enableDevelopmentMessages().setPort(8080).build()

        await server1.listen()

        // Act
        const f = server2.listen()

        // Assert
        await expect(f).to.eventually.be.rejectedWith(Error)

        // Close
        await Promise.all([ server1.close(), server2.close() ])
    }

    @test
    async getWithAdditionalEndpointAndQueryUsageAndParamUsageAndResponseMiddlewareAndJsonBodyIntegrationTest() {
        // Arrange
        let responseBody: string | null = null
        let responseCode: number | null = null

        class FakeResponse {
            writeHead(code: number, _: { [key: string]: string | number | string[] }){
                responseCode = code
            }

            end(body?: string, resolve?: () => void) {
                responseBody = body ?? null
                resolve?.()
            }
        }

        let callback: MockCallback | null = null
        const server = WebServer.Builder.createMock(cb => { callback = cb })
        const booksEndpoint = server.root.createEndpointAtPath("books")

        booksEndpoint.get("/{id}/info.json", request => {
            return new ResponseBuilder().setJsonBody({
                id: request.url.params.get("id"),
                language: request.url.query.get("lang")
            }).build()
        })

        booksEndpoint.addResponseMiddleware((_, response) => {
            if(response === null) return null
            const json = JSON.parse(response.body ?? "{}")
            return new ResponseBuilder().setJsonBody({
                id: parseInt(json.id),
                lang: json.language.toUpperCase()
            }).build()
        });

        // Act
        await Async.wrapInPromise(callback as unknown as MockCallback)(
            createFakeHttpRequest({scheme: "https", domain: "localhost", path: "/books/1234/info.json?lang=nl"}, "GET"),
            new FakeResponse() as Http2ServerResponse
        )

        // Assert
        expect(responseCode).to.be.not.null
        expect(responseBody).to.be.not.null
        expect(responseCode).to.equal(200)
        const parsedResponseBody = JSON.parse(responseBody ?? "{}")
        expect(parsedResponseBody).to.have.property("lang")
        expect(parsedResponseBody).to.have.property("id")
        expect(parsedResponseBody).to.not.have.property("language")
        expect(parsedResponseBody.lang).to.equal("NL")
        expect(parsedResponseBody.id).to.equal(1234)
    }
}
