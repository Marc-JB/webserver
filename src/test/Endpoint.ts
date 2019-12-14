import { suite, test, expect } from "../../lib/test/index"
import { Endpoint, WebServer } from "../main/index"

@suite
export class EndpointTests {
    @test
    async createEndpointAtPathShouldAttachEndpointToRightPath() {
        // Arrange
        const server = await new WebServer.Builder().enableDevelopmentMessages().build()
        const endpoint1 = new Endpoint("/resource", server)

        // Act
        const endpoint2 = endpoint1.createEndpointAtPath("/subresource")

        // Assert
        expect(endpoint1.fullPath).to.equal("resource")
        expect(endpoint2.fullPath).to.equal("resource/subresource")
    }
}
