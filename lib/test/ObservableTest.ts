import { Test, expect, Suite } from "./index"
import { Observable, Async } from "../main/index"

@Suite
export class ObservableTests {
    @Test
    async oneTimeObservablePromiseShouldInvokeCorrectly() {
        // Arrange
        const observable = new Observable(0)
        const promise = observable.observeOncePromise();

        // Act
        (async function timeSetter() {
            await Async.sleep(20)
            observable.set(observable.get() + 1)
        })()

        // Assert
        await Promise.all([
            expect(promise).to.eventually.be.fulfilled,
            expect(promise).to.eventually.become(1)
        ])
    }
}
