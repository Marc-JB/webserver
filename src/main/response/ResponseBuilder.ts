import { ReadonlyResponseInf } from "./ResponseInf"
import { ContentEncoding } from "../lib"

export class ResponseBuilder {
    protected code: number | "auto" = "auto"
    protected body: string | null = null
    protected readonly headers: Map<string, number | string | string[]> = new Map()

    public setStatusCode(status: number | "auto"): this {
        this.code = status
        return this
    }

    public setHtmlBody(body: string): this {
        this.setContentType("text/html; charset=utf-8")
        this.body = body
        return this
    }

    public setPlainTextBody(body: string): this {
        this.setContentType("text/plain; charset=utf-8")
        this.body = body
        return this
    }

    public setJsonBody(body: any, replacer: ((this: any, key: string, value: any) => any) | null = null, space: string | number | null = 4): this {
        this.setContentType("application/json;charset=UTF-8")
        this.body = JSON.stringify(body, replacer ?? undefined, space ?? undefined)
        return this
    }

    public setHeader(key: string, value: number | string | string[]): this {
        this.headers.set(key, value)
        return this
    }

    public setCacheExpiration(expirationInSeconds: number): this {
        const now = new Date()
        now.setTime(now.getTime() + expirationInSeconds * 1000)
        this.setHeader("Cache-Control", `public, max-age=${expirationInSeconds}, s-maxage=${expirationInSeconds}`)
        this.setHeader("Expires", now.toUTCString())
        return this
    }

    public setCacheExpirationDate(expirationDate: Date): this {
        const now = new Date()
        const expirationInSeconds = Math.round((expirationDate.getTime() - now.getTime()) / 1000)
        this.setHeader("Cache-Control", `public, max-age=${expirationInSeconds}, s-maxage=${expirationInSeconds}`)
        this.setHeader("Expires", expirationDate.toUTCString())
        return this
    }

    public setContentType(value: string): this {
        return this.setHeader("Content-Type", value)
    }

    public setContentEncoding(values: ContentEncoding[]): this {
        return this.setHeader("Content-Encoding", values.join(", "))
    }

    public setCORS(allowedOrigins: string = "*", allowedMethods: string[] = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: string[] = ["X-Requested-With", "Content-Type"]): this {
        return this
            .setHeader("Access-Control-Allow-Origin", allowedOrigins)
            .setHeader("Access-Control-Allow-Methods", allowedMethods.join(", "))
            .setHeader("Access-Control-Allow-Headers", allowedHeaders.join(", "))
    }

    public setClientShouldDownloadBody(shouldDownload: boolean, filename: string | null = null) {
        if(this.headers.has("Content-Disposition")) {
            this.headers.delete("Content-Disposition")
        }

        if(shouldDownload) {
            this.headers.set("Content-Disposition", "attachment" + filename === null ? "" : `; filename="${filename}"`)
        }
    }

    public build(): ReadonlyResponseInf {
        return {
            code: this.code === "auto" ? this.body === null ? 204 : 200 : this.code,
            body: this.body,
            headers: this.headers
        }
    }

    public static redirectResponse(newLocation: string, isPermanentRedirect: boolean = false): ReadonlyResponseInf {
        const headers = new Map()
        headers.set("Location", newLocation)
        return {
            code: isPermanentRedirect ? 308 : 307,
            body: null,
            headers: headers
        }
    }
}
