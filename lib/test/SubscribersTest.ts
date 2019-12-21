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

    @Test
    async subscribersListShouldBeRetainedProperly() {
        // Arrange
        const executedSubscribers = new Array()
        const subs = new Subscribers()

        subs.add(() => { executedSubscribers.push("A") })
        subs.add(() => { executedSubscribers.push("B") })

        // Act
        await subs.notifyAll(false)
        await subs.notifyAll(false)

        // Assert
        expect(executedSubscribers).to.have.lengthOf(4)
        expect(executedSubscribers).to.include("A")
        expect(executedSubscribers).to.include("B")
    }

    @Test
    async argsShouldBePassedCorrectly() {
        // Arrange
        let result: [string, number] | null = null
        const subs = new Subscribers()

        subs.add((first: string, second: number) => {
            result = [first, second]
        })

        // Act
        await subs.notifyAll(true, "A", 5)

        // Assert
        expect(result).to.be.not.null
        expect((result as unknown as [string, number])[0]).to.be.a("string").and.equal("A")
        expect((result as unknown as [string, number])[1]).to.be.a("number").and.equal(5)
    }
}
