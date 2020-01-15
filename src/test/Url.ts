import { suite, test, expect } from "../../lib/test/index"
import { parseUrl, parseUrlWithParams } from "../main"

@suite
export class UrlTests {
    @test
    parseUrlShouldChangeQueryIntoMap(){
        // Arrange
        const url = "https://localhost:443/index.html?lang=en&hello=world"

        // Act
        const newUrl = parseUrl(url)

        // Assert
        expect(newUrl).to.have.property("query")
        expect(newUrl.query).to.be.an.instanceOf(Map)
        expect(newUrl.query).to.have.lengthOf(2)
        expect(newUrl.query.has("lang")).to.be.true
        expect(newUrl.query.get("lang")).to.equal("en")
        expect(newUrl.query.has("hello")).to.be.true
        expect(newUrl.query.get("hello")).to.equal("world")
        expect(newUrl.query.has("boo")).to.be.false
    }

    @test
    parseUrlWithParamsShouldAddEmptyParamsMap(){
        // Arrange
        const url = "https://localhost:443/index.html?lang=en&hello=world"

        // Act
        const newUrl = parseUrlWithParams(url)

        // Assert
        expect(newUrl).to.have.property("params")
        expect(newUrl.params).to.be.an.instanceOf(Map)
        expect(newUrl.params).to.have.lengthOf(0)
        expect(newUrl.params.has("lang")).to.be.false
    }
}
