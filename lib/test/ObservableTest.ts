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
            observable.value++
        })()

        // Assert
        await Promise.all([
            expect(promise).to.eventually.be.fulfilled,
            expect(promise).to.eventually.become(1)
        ])
    }

    @Test
    observerShouldBeUnsubscribedWhenObserverReturnsFalse() {
        // Arrange
        let numberOfTimesObserverIsCalled = 0
        const observable = new Observable(0)
        observable.observe(value => {
            numberOfTimesObserverIsCalled++
            return value < 2
        })

        // Act
        observable.value++
        observable.value++
        observable.value++
        observable.value++
        observable.value++

        // Assert
        expect(numberOfTimesObserverIsCalled).to.equal(2)
    }
}
