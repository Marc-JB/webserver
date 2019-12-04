import { suite, test, expect } from "./TestSuite"
import { Endpoint, WebServerBuilder } from "../main/index"

@suite
export class EndpointTests {
    @test
    async createEndpointAtPathShouldAttachEndpointToRightPath() {
        // Arrange
        const server = await new WebServerBuilder().build()
        const endpoint1 = new Endpoint("/resource", server)

        // Act
        const endpoint2 = endpoint1.createEndpointAtPath("/subresource")

        // Assert
        expect(endpoint1.fullPath).to.equal("resource")
        expect(endpoint2.fullPath).to.equal("resource/subresource")
    }
}