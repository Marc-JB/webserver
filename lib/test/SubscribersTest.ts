import { Test, expect, Suite } from "./index"
import { Subscribers, Async } from "../main/index"

@Suite
export class SubscribersTest {
    @Test
    async notifyAllShouldInvokeAllAddedSubscribersAndClearSubscriberList() {
        // Arrange
        const executedSubscribers = new Set()
        const subs = new Subscribers()

        subs.add(() => {
            executedSubscribers.add("A")
        })

        subs.add(async() => {
            await Async.sleep(20)
            executedSubscribers.add("B")
            await Async.sleep(20)
        })

        // Act
        await subs.notifyAll()
        await subs.notifyAll() // Make sure the list is cleared

        // Assert
        expect(executedSubscribers).to.have.lengthOf(2)
        expect(executedSubscribers).to.include("A")
        expect(executedSubscribers).to.include("B")
    }
}
