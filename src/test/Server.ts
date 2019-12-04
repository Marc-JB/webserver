import { suite, test, expect } from "./TestSuite"
import { WebServerBuilder } from "../main/index"

@suite
export class ServerTests {
    @test
    async connectShouldThrowErrorWhenPortIsInUse(){
        // Arrange
        const server1 = await new WebServerBuilder().build()
        const server2 = await new WebServerBuilder().build()

        await server1.connect(8080)

        // Act
        const f = server2.connect(8080)

        // Assert
        await expect(f).to.eventually.be.rejectedWith(Error)

        // Close
        await Promise.all([ server1.close(), server2.close() ])
    }
}
