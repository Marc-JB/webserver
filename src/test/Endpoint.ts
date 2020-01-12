import { suite, test, expect } from "../../lib/test/index"
import { Endpoint } from "../main/index"

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
}
