import { suite, test, expect } from "../../lib/test/index"
import { WebServer, CONNECTION_TYPE } from "../main/index"

@suite
export class WebServerBuilderTests {
    @test
    async webServerBuilderShouldCreateHttp2Server(){
        // Arrange & Act
        const server = await new WebServer.Builder().enableDevelopmentMessages().setPort(8080).build()

        // Assert
        expect(server.isHTTPS).to.be.false
        expect(server.connectionType).to.equal(CONNECTION_TYPE.HTTP2)
    }

    @test
    async webServerBuilderWithUseHttp1ShouldCreateHttp1Server(){
        // Arrange & Act
        const server = await new WebServer.Builder().enableDevelopmentMessages().setPort(8080).useHttp1().build()

        // Assert
        expect(server.isHTTPS).to.be.false
        expect(server.connectionType).to.equal(CONNECTION_TYPE.HTTP1)
    }
}
