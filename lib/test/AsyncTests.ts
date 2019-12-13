import { Suite, expect, Test } from "./index"
import { Async } from "../main/index"

@Suite
export class AsyncTests {
    @Test
    async wrapInPromiseShouldReturnAsyncFunction() {
        // Arrange
        const asyncFunction = async (i: number, n: number): Promise<number> => (i + n)

        // Act
        const wrapped = Async.wrapInPromise(asyncFunction)

        // Assert
        expect(wrapped(2, 3)).to.be.an.instanceOf(Promise)
        await expect(wrapped(2, 3)).to.eventually.be.fulfilled
        await expect(wrapped(2, 3)).to.eventually.equal(5)
    }

    @Test
    async wrapInPromiseShouldWrapNonAsyncFunctionCorrectly() {
        // Arrange
        const syncFunction = (i: number, n: number): number => (i + n)

        // Act
        const wrapped = Async.wrapInPromise(syncFunction)

        // Assert
        expect(wrapped(2, 3)).to.be.an.instanceOf(Promise)
        await expect(wrapped(2, 3)).to.eventually.be.fulfilled
        await expect(wrapped(2, 3)).to.eventually.equal(5)
    }

    @Test
    async wrapInPromiseShouldHandleThrownErrorsCorrectly() {
        // Arrange
        const syncFunction = (name: string) => { throw new Error(`Hello ${name}!`) }

        // Act
        const wrapped = Async.wrapInPromise(syncFunction)

        // Assert
        expect(wrapped("world")).to.be.an.instanceOf(Promise)
        await expect(wrapped("world")).to.eventually.be.rejectedWith(Error, "Hello world!")
    }
}
