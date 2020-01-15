import { ConsoleInput } from "./ConsoleInput"
import { Application } from "./Application"

if("setRawMode" in process.stdin) {
    const input = new ConsoleInput()
    console.log("To start running the server, press 's'.")
    input.once("escape", () => process.exit(0))
    input.once("ctrl+c", () => process.exit(0))
    input.once("s", () => new Application(input).start().catch(console.error))
}
