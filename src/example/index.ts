import { promises as afs } from "fs"
import readline from "readline"
import { WebServer, ResponseBuilder } from "../main/index"
import { Lazy } from "../main/lib"

async function main(){
    console.log("Building server & loading certificates...")

    const server = await new WebServer.Builder()
        .enableDevelopmentMessages()
        .setCert(await afs.open("../localhost.crt", "r"))
        .setKey(await afs.open("../localhost.key", "r"))
        .build()

    console.log("Connecting server...")

    await server.listen()

    const root = server.createEndpointAtPath("/")

    root.addRequestMiddleware(request => {
        request.customSettings.set("requestedLanguage", request.url.query["lang"] === "nl" ? "nl-NL" : "en-US")
    })

    const indexPage = new Lazy(async () => {
        const file = await afs.open("./res/example/index.html", "r")
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
            const file = await afs.open("./res/example/404.html", "r")
            const buffer = await file.readFile()
            const body = buffer.toString()
            await file.close()
            return new ResponseBuilder().setStatusCode(404).setHtmlBody(body).build()
        }

        return response
    })

    readline.emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    process.stdin.on('keypress', async (_, key) => {
        if ((key.ctrl && key.name === 'c') || key.name === "escape") {
            console.log('Shutting down HTTP server...')
            await server.close()
            console.log("Server succesfully shut down.")
            process.exit(0);
        } else if (key.name === "s") {
            console.log("Server: " + JSON.stringify(server.toJSON(), undefined, 4))
        } else if (key.name === "c") {
            console.log("Server children: " + JSON.stringify(server.toJSON().children, undefined, 4))
        }
    })

    console.log(`Server active and operational on http${server.isHTTPS ? "s" : ""}://localhost:${server.port}/.`)
}

main().catch(console.error)
