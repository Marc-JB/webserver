import "mocha"
import * as chai from "chai"
import { Server, Endpoint } from "../../build/main";

chai.should()

describe(`Endpoint`, () => {
    it(`Route should create a new endpoint, add it to the children and return it`, () => {
        // Arrange
        const server = new Server()
        
        // Act
        const endpoint = server.route("/resource")

        // Assert
        endpoint.should.be.an.instanceOf(Endpoint)
        server.children.should.contain(endpoint)
    })

    it(`Route should attach the endpoint to the right path`, () => {
        // Arrange
        const server = new Server()
        
        // Act
        const endpoint1 = server.route("/resource")
        const endpoint2 = endpoint1.route("/subresource")

        // Assert
        const path1 = endpoint1.fullPath
        const path2 = endpoint2.fullPath
        path1.should.equal("resource")
        path2.should.equal("resource/subresource")
    })
})