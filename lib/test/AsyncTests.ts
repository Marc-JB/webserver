import { Suite, expect, Test } from "./index"
import { Async } from "../main/index"

@Suite
export class AsyncTests {
    @Test
    async wrapInPromiseShouldReturnAsyncFunction() {
        // Arrange
        const asyncFunction = async (i: number, n: number) => {
            await Async.sleep(25)
            return i + n
        }

        // Act
        const wrapped = Async.wrapInPromise(asyncFunction)

        // Assert
        const promise = wrapped(2, 3)
        expect(promise).to.be.an.instanceOf(Promise)
        await expect(promise).to.eventually.be.fulfilled
        await expect(promise).to.eventually.equal(5)
    }

    @Test
    async wrapInPromiseShouldWrapNonAsyncFunctionCorrectly() {
        // Arrange
        const syncFunction = (i: number, n: number): number => (i + n)

        // Act
        const wrapped = Async.wrapInPromise(syncFunction)

        // Assert
        const promise = wrapped(2, 3)
        expect(promise).to.be.an.instanceOf(Promise)
        await expect(promise).to.eventually.be.fulfilled
        await expect(promise).to.eventually.equal(5)
    }

    @Test
    async wrapInPromiseShouldHandleThrownErrorsCorrectly() {
        // Arrange
        const syncFunction = (name: string) => { throw new Error(`Hello ${name}!`) }

        // Act
        const wrapped = Async.wrapInPromise(syncFunction)

        // Assert
        const promise = wrapped("world")
        expect(promise).to.be.an.instanceOf(Promise)
        await expect(promise).to.eventually.be.rejectedWith(Error, "Hello world!")
    }

    @Test
    async sleepSleepsCorrectly() {
        // Arrange
        const sleepTime = 60

        // Act
        const start = new Date().getTime()
        await Async.sleep(sleepTime)
        const end = new Date().getTime()

        // Assert
        expect(end - start).to.be.approximately(sleepTime, 20)
    }
}
