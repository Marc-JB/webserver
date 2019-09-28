import { suite, test } from "@testdeck/mocha"
import "mocha"
import * as chai from "chai"
import { Server, Endpoint } from "../../build/main/index"

chai.should()

@suite
class EndpointTests {
    @test
    routeShouldCreateNewEndpointAsChild() {
        // Arrange
        const server = new Server().root
        
        // Act
        const endpoint = server.route("/resource")

        // Assert
        endpoint.should.be.an.instanceOf(Endpoint)
        server.children.should.contain(endpoint)
    }

    @test
    routeShouldAttachEndpointToRightPath() {
        // Arrange
        const server = new Server().root
        
        // Act
        const endpoint1 = server.route("/resource")
        const endpoint2 = endpoint1.route("/subresource")

        // Assert
        const path1 = endpoint1.fullPath
        const path2 = endpoint2.fullPath
        path1.should.equal("resource")
        path2.should.equal("resource/subresource")
    }
}