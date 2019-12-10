import { suite, test, expect } from "./index"
import { Maps } from "../main/index"

@suite
export class MapTests {
    @test
    rewriteMapAsObjectShouldReturnEmptyObjectForEmptyMap(){
        // Arrange
        const map = new Map()

        // Act
        const result = Maps.rewriteMapAsObject(map)

        // Assert
        expect(result).to.be.a("object")
        expect(result).to.be.empty
    }

    @test
    rewriteMapAsObjectShouldReturnNonEmptyObjectForNonEmptyMap(){
        // Arrange
        const map = new Map()
        const key = "hello"
        const value = "world"
        map.set(key, value)

        // Act
        const result = Maps.rewriteMapAsObject(map)

        // Assert
        expect(result).to.be.a("object")
        expect(result).to.be.not.empty
        expect(result).to.have.property(key)
        expect(result[key]).to.be.a("string")
        expect(result[key]).to.equal(value)
    }

    @test
    rewriteMapAsObjectShouldNotAddUndefined(){
        // Arrange
        const map = new Map()
        const key = "thisOneIsUndefined"
        const value = undefined
        map.set(key, value)

        // Act
        const result = Maps.rewriteMapAsObject(map)

        // Assert
        expect(result).to.be.a("object")
        expect(result).to.be.empty
        expect(result).to.not.have.property(key)
    }

    @test
    rewriteMapAsObjectWithExplicitUndefinedShouldAddUndefinedProperty(){
        // Arrange
        const map = new Map()
        const key = "thisOneIsUndefined"
        const value = undefined
        map.set(key, value)

        // Act
        const result = Maps.rewriteMapAsObject(map, undefined, false)

        // Assert
        expect(result).to.be.a("object")
        expect(result).to.be.not.empty
        expect(result).to.have.property(key)
        expect(result[key]).to.be.an("undefined")
        expect(result[key]).to.equal(value)
    }
}
