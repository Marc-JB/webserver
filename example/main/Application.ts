import { promises as afs } from "fs"
import { WebServer, ResponseBuilder } from "../../src/main/index"
import { Lazy } from "../../lib/main"
import { ConsoleInput } from "./ConsoleInput"

export class Application {
    protected server: WebServer | null = null

    constructor(protected input: ConsoleInput){}

    async start() {
        console.log("Building server & loading certificates...")

        this.server = await new WebServer.Builder()
            .enableDevelopmentMessages()
            .setCert(await afs.open("../localhost.crt", "r"))
            .setKey(await afs.open("../localhost.key", "r"))
            .build()

        console.log("Connecting server...")

        await this.server.listen()

        this.input.once("ctrl+c", () => this.stop())
        this.input.once("escape", () => this.stop())

        const root = this.server.root

        root.addRequestMiddleware(request => {
            request.customSettings.set("requestedLanguage", request.url.query["lang"] === "nl" ? "nl-NL" : "en-US")
        })

        const indexPage = new Lazy(async () => {
            const file = await afs.open("./example/res/index.html", "r")
            const buffer = await file.readFile()
            const body = buffer.toString()
            await file.close()
            return body
        })

        root.get("", async request => {
            const body = (await indexPage.value)
                .replace("${info}", `Do Not Track enabled: ${request.doNotTrackEnabled ? "yes" : "no"}<br>` +
                    `Data saver enabled: ${request.dataSaverEnabled ? "yes" : "no"}<br>` +
                    `Requested language: ${request.customSettings.get("requestedLanguage")}`)
            return new ResponseBuilder().setStatusCode(200).setHtmlBody(body).build()
        })

        root.get("index.html", () => ResponseBuilder.redirectResponse("./", true))

        root.get("duplicate.html", () => new ResponseBuilder().setStatusCode(200).build())
        root.get("duplicate.html", () => new ResponseBuilder().setStatusCode(200).build())

        root.get("README.md", request => {
            return new ResponseBuilder()
                .setStatusCode(200)
                .setPlainTextBody(request.customSettings.get("requestedLanguage") === "nl-NL" ? "# Voorbeeldbestand\n\nVoorbeeldtekst" :"# Example file\n\nExample text")
                .setContentType("text/markdown")
                .setHeader("Content-Language", request.customSettings.get("requestedLanguage"))
                .build()
        })

        root.addResponseMiddleware(async (request, response) => {
            if(response === null && request.url.path !== "/ws404.html") {
                const file = await afs.open("./example/res/404.html", "r")
                const buffer = await file.readFile()
                const body = buffer.toString()
                await file.close()
                return new ResponseBuilder().setStatusCode(404).setHtmlBody(body).build()
            }

            return response
        })

        this.input.on("i", () => console.log("Server: " + JSON.stringify(this.server?.toJSON(), undefined, 4)))

        console.log(`Server active and operational on http${this.server.isHTTPS ? "s" : ""}://localhost:${this.server.port}/. Press 'i' for info. Press 'esc' or 'ctrl'+'c' to exit.`)
    }

    async stop() {
        console.log("Shutting down HTTP server...")
        await this.server?.close()
        console.log("Server succesfully shut down.")
        process.exit(0)
    }
}
