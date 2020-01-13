import { suite, test, expect } from "../../lib/test/index"
import { WebServer, CONNECTION_TYPE, ResponseBuilder } from "../main/index"
import { Http2Server, Http2ServerRequest, Http2ServerResponse } from "http2"
import { createFakeHttpRequest } from "./Endpoint"

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

        class CustomResponse {
            writeHead(code: number, _: { [key: string]: string | number | string[] }){
                responseCode = code
            }

            end(body?: string, resolve?: () => void) {
                responseBody = body ?? null
                resolve?.()
            }
        }

        type CbType = (req: Http2ServerRequest, res: Http2ServerResponse) => Promise<void>
        let callback: CbType | null = null
        class CustomHttpServer {
            on(_: "request", cb: CbType) { callback = cb }
        }

        const server = new WebServer((new CustomHttpServer() as any as Http2Server), 443, CONNECTION_TYPE.HTTPS2, true)
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
        await (callback as CbType | null)?.(createFakeHttpRequest({scheme: "https", domain: "localhost", path: "/books/1234/info.json?lang=nl"}, "GET"), new CustomResponse() as Http2ServerResponse)

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
