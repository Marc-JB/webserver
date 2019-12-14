import { suite, test, expect } from "../../lib/test/index"
import { Server } from "../main/index"

@suite
export class ServerTests {
    @test
    async connectShouldThrowErrorWhenPortIsInUse(){
        // Arrange
        const server1 = await new Server.Builder().enableDevelopmentMessages().build()
        const server2 = await new Server.Builder().enableDevelopmentMessages().build()

        await server1.connect(8080)

        // Act
        const f = server2.connect(8080)

        // Assert
        await expect(f).to.eventually.be.rejectedWith(Error)

        // Close
        await Promise.all([ server1.close(), server2.close() ])
    }
}
