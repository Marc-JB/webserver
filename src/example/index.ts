import { promises as afs } from "fs"
import readline from "readline"
import { WebServer, ResponseBuilder } from "../main/index"

async function main(){
    console.log("Building server & loading certificates...")

    const server = await new WebServer.Builder()
        .enableDevelopmentMessages()
        .setCert(await afs.open("../localhost.crt", "r"))
        .setKey(await afs.open("../localhost.key", "r"))
        .build()

    console.log("Connecting server...")

    await server.connect(443, 8080)

    const root = server.createEndpointAtPath("/")

    const homepage = async () => {
        const file = await afs.open("./src/example/index.html", "r")
        const buffer = await file.readFile()
        const body = buffer.toString()
        await file.close()
        return new ResponseBuilder().setStatus(200).setBody(body, true).build()
    }

    root.get("index.html", homepage)
    root.get("", homepage)

    root.get("README.md", request => {
        return new ResponseBuilder()
            .setStatus(200)
            .setBody(request.url.query["lang"] === "nl" ? "# Voorbeeldbestand\n\nVoorbeeldtekst" :"# Example file\n\nExample text", false)
            .setHeader("Content-Type", "text/markdown")
            .setHeader("Language", request.url.query["lang"] === "nl" ? "nl-NL" : "en-US")
            .build()
    })

    root.addResponseMiddleware(async (_, response) => {
        if(response === null) {
            const file = await afs.open("./src/example/404.html", "r")
            const buffer = await file.readFile()
            const body = buffer.toString()
            await file.close()
            return new ResponseBuilder().setStatus(404).setBody(body, true).build()
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
        } else if (key.name === "i") {
            console.log("List of running instances: " + Array.from(server.instances).map(it => typeof it === "string" ? `"${it}"`: it).join(", "))
        } else if (key.name === "d") {
            console.log("Server: " + JSON.stringify(server.toJSON(), undefined, 4))
        } else if (key.name === "c") {
            console.log("Server children: " + JSON.stringify(server.toJSON().children, undefined, 4))
        }
    })

    console.log("Server active and operational.")
}

main().catch(console.error)