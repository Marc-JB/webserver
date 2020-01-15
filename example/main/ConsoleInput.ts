import readline from "readline"
import { Async } from "../../lib/main"

export class ConsoleInput {
    protected readonly listeners: Map<string, () => Async.MaybeAsync<boolean>> = new Map()

    constructor(readstream: NodeJS.ReadStream = process.stdin) {
        readline.emitKeypressEvents(readstream)
        readstream.setRawMode(true)
        readstream.on('keypress', async (_, key) => {
            let condition = (key.ctrl ? "ctrl+" : "") + key.name
            if(this.listeners.has(condition)) {
                const result = await Async.wrapInPromise(this.listeners.get(condition) ?? (() => false))()
                if(!result) this.listeners.delete(condition)
            }
        })
    }

    listen(condition: string, listener: () => Async.MaybeAsync<boolean>) {
        this.remove(condition)
        this.listeners.set(condition, listener)
    }

    on(condition: string, listener: () => Async.MaybeAsync<void>) {
        this.remove(condition)
        this.listeners.set(condition, () => {
            listener()
            return true
        })
    }

    once(condition: string, listener: () => Async.MaybeAsync<void>) {
        this.remove(condition)
        this.listeners.set(condition, () => {
            listener()
            return false
        })
    }

    remove(condition: string) {
        if(this.listeners.has(condition)) this.listeners.delete(condition)
    }

    removeAll(){
        this.listeners.clear()
    }
}
