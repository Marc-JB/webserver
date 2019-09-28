import { suite, test } from "@testdeck/mocha";
import "mocha"
import * as chai from "chai"
import { Server, PortInUseException } from "../../build/main/index";

chai.should()

@suite
class ServerTests {
    @test
    serverShouldHaveEmptyPath() {
        // Arrange
        const server = new Server()

        // Act
        const path = server.fullPath

        // Assert
        path.should.be.a("string").which.is.empty
    }

    @test
    async serverListen_ShouldThrowPortInUseException_WhenPortIsInUse(){
        // Arrange
        const server1 = new Server()
        const server2 = new Server()
        let error = {}

        // Act
        try {
            await server1.startWithoutSecurity()
            await server2.startWithoutSecurity()
        } catch (e) {
            error = e
        }

        // Assert
        error.should.not.be.undefined
        error.should.not.be.null
        error.should.not.eql({})
        error.should.be.an.instanceOf(PortInUseException)
    }
}