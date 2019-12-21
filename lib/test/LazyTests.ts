import { Test, expect, Suite } from "./index"
import { Lazy, Async } from "../main/index"

@Suite
export class LazyTests {
    @Test
    lazyExecutionOrderCheck(){
        // Arrange
        const order = new Array()

        // Act
        order.push("A")

        const lazy = new Lazy(() => {
            order.push("C")
            return new Date().getTime()
        })

        order.push("B")
        const first = lazy.value
        order.push("D")
        const second = lazy.value
        order.push("E")

        // Assert
        expect(order).to.have.lengthOf(5) // Check against double execution of lazy initialiser
        expect(order[0]).to.equal("A")
        expect(order[1]).to.equal("B")
        expect(order[2]).to.equal("C")
        expect(order[3]).to.equal("D")
        expect(order[4]).to.equal("E")
        expect(first).to.equal(second)
    }

    @Test
    isInitialisedShouldReturnFalseExceptAfterFirstExecution() {
        // Arrange
        const lazy = new Lazy(() => new Date().getTime())

        // Act
        const first = lazy.isInitialized
        lazy.value
        const second = lazy.isInitialized
        lazy.value
        const third = lazy.isInitialized

        // Assert
        expect(first).to.be.false
        expect(second).to.be.true
        expect(third).to.be.true // Check if isInitialized does not 'flip' its value after each call to lazy.value
    }

    @Test
    async promiseShouldRunAfterLazyIsInvoked() {
        // Arrange
        const order = new Array()

        const lazy = new Lazy(async() => {
            await Async.sleep(25)
            order.push("B")
            return new Date().getTime()
        })

        // Act
        order.push("A")
        await lazy.value
        order.push("C")

        // Assert
        expect(order).to.have.lengthOf(3) // Check for weird side-effects of using a Promise inside a lazy initialiser
        expect(order[0]).to.equal("A")
        expect(order[1]).to.equal("B")
        expect(order[2]).to.equal("C")
    }
}
