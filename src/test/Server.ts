import { suite, test, expect } from "../../lib/test/index"
import { WebServer, CONNECTION_TYPE } from "../main/index"

@suite
export class ServerTests {
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
