import { Test, NamedSuite, NamedTest, expect } from "./index"
import { Maps } from "../main/index"

@NamedSuite("Map -> Object tests")
export class MapToObjectTests {
    @NamedTest("rewrite should return {} for empty Map")
    rewriteShouldReturnEmptyObjectForEmptyMap(){
        // Arrange
        const map = new Map()

        // Act
        const result = Maps.rewriteMapAsObject(map)

        // Assert
        expect(result).to.be.an("object")
        expect(result).to.be.empty
    }

    @Test
    rewriteShouldReturnNonEmptyObjectForNonEmptyMap(){
        // Arrange
        const map = new Map()
        const key = "hello"
        const value = "world"
        map.set(key, value)

        // Act
        const result = Maps.rewriteMapAsObject(map)

        // Assert
        expect(result).to.be.an("object")
        expect(result).to.be.not.empty
        expect(result).to.have.property(key)
        expect(result[key]).to.equal(value)
    }

    @Test
    rewriteShouldNotAddUndefined(){
        // Arrange
        const map = new Map()
        const key = "thisOneIsUndefined"
        const value = undefined
        map.set(key, value)

        // Act
        const result = Maps.rewriteMapAsObject(map)

        // Assert
        expect(result).to.be.an("object")
        expect(result).to.be.empty
        expect(result).to.not.have.property(key)
    }

    @Test
    rewriteWithExplicitUndefinedShouldAddUndefinedProperty(){
        // Arrange
        const map = new Map()
        const key = "thisOneIsUndefined"
        const value = undefined
        map.set(key, value)

        // Act
        const result = Maps.rewriteMapAsObject(map, undefined, false)

        // Assert
        expect(result).to.be.an("object")
        expect(result).to.be.not.empty
        expect(result).to.have.property(key)
        expect(result[key]).to.equal(value)
    }

    @Test
    rewriteWithCustomObjectShouldAddPropertiesCorrectly(){
        // Arrange
        const obj: { [key: string]: any } = {}
        const map: Map<string, any> = new Map()

        const key1 = "hello"
        const value1 = "world!"

        obj[key1] = value1

        const key2 = "hoursPerDay"
        const value2 = 24

        map.set(key2, value2)

        // Act
        const result = Maps.rewriteMapAsObject(map, obj)

        // Assert
        expect(result).to.equal(obj)
        expect(result).to.be.an("object")
        expect(result).to.be.not.empty
        expect(result).to.have.property(key1)
        expect(result).to.have.property(key2)
        expect(result[key1]).to.equal(value1)
        expect(result[key2]).to.equal(value2)
    }
}

@NamedSuite("Object -> Map tests")
export class ObjectToMapTests {
    @NamedTest("rewrite should return empty Map for {}")
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

    @Test
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

    @Test
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

    @Test
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

    @Test
    rewriteWithCustomMapShouldAddPropertiesCorrectly(){
        // Arrange
        const map: Map<string, any> = new Map()
        const obj: { [key: string]: any } = {}

        const key1 = "hello"
        const value1 = "world!"

        map.set(key1, value1)

        const key2 = "hoursPerDay"
        const value2 = 24

        obj[key2] = value2

        // Act
        const result = Maps.rewriteObjectAsMap(obj, map)

        // Assert
        expect(result).to.equal(map)
        expect(result).to.be.an.instanceOf(Map)
        expect(result).to.be.not.empty
        expect(result.size).to.equal(2)
        expect(result.has(key1)).to.be.true
        expect(result.has(key2)).to.be.true
        expect(result.get(key1)).to.equal(value1)
        expect(result.get(key2)).to.equal(value2)
    }
}
