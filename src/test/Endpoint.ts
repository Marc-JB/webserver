import { suite, test, expect } from "./TestSuite"
import { Endpoint } from "../main/index"

@suite
export class EndpointTests {
    @test
    routeShouldAttachEndpointToRightPath() {
        // Arrange
        const endpoint1 = new Endpoint("/resource")

        // Act
        const endpoint2 = endpoint1.route("/subresource")

        // Assert
        expect(endpoint1.fullPath).to.equal("resource")
        expect(endpoint2.fullPath).to.equal("resource/subresource")
    }
}
