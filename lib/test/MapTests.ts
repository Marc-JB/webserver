import { suite, test, expect } from "./index"
import { Maps } from "../main/index"

@suite
export class MapToObjectTests {
    @test
    rewriteShouldReturnEmptyObjectForEmptyMap(){
        // Arrange
        const map = new Map()

        // Act
        const result = Maps.rewriteMapAsObject(map)

        // Assert
        expect(result).to.be.a("object")
        expect(result).to.be.empty
    }

    @test
    rewriteShouldReturnNonEmptyObjectForNonEmptyMap(){
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
    rewriteShouldNotAddUndefined(){
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
    rewriteWithExplicitUndefinedShouldAddUndefinedProperty(){
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

@suite
export class ObjectToMapTests {
    @test
    rewriteShouldReturnEmptyMapForEmptyObject(){
        // Arrange
        const obj = {}

        // Act
        const result = Maps.rewriteObjectAsMap(obj)

        // Assert
        expect(result).to.be.an.instanceOf(Map)
        expect(result).to.be.empty
        expect(result.size).to.equal(0)
    }

    @test
    rewriteShouldReturnNonEmptyMapForNonEmptyObject(){
        // Arrange
        const obj: { [key: string]: any } = {}
        const key = "hello"
        const value = "world"
        obj[key] = value

        // Act
        const result = Maps.rewriteObjectAsMap(obj)

        // Assert
        expect(result).to.be.an.instanceOf(Map)
        expect(result).to.be.not.empty
        expect(result.size).to.equal(1)
        expect(result.has(key)).to.be.true
        expect(result.get(key)).to.equal(value)
    }

    @test
    rewriteShouldNotAddUndefined(){
        // Arrange
        const obj: { [key: string]: any } = {}
        const key = "thisOneIsUndefined"
        const value = undefined
        obj[key] = value

        // Act
        const result = Maps.rewriteObjectAsMap(obj)

        // Assert
        expect(result).to.be.an.instanceOf(Map)
        expect(result).to.be.empty
        expect(result.size).to.equal(0)
        expect(result.has(key)).to.be.false
    }

    @test
    rewriteWithExplicitUndefinedShouldAddUndefinedProperty(){
        // Arrange
        const obj: { [key: string]: any } = {}
        const key = "thisOneIsUndefined"
        const value = undefined
        obj[key] = value

        // Act
        const result = Maps.rewriteObjectAsMap(obj, undefined, false)

        // Assert
        expect(result).to.be.an.instanceOf(Map)
        expect(result).to.be.not.empty
        expect(result.size).to.equal(1)
        expect(result.has(key)).to.be.true
        expect(result.get(key)).to.equal(value)
    }
}
