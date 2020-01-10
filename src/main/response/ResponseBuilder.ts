import { ResponseInf } from "../Endpoint"

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

    public setContentType(value: string): this {
        return this.setHeader("Content-Type", value)
    }

    public setCORS(allowedOrigins: string = "*", allowedMethods: string[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: string[] = ["X-Requested-With", "Content-Type"]): this {
        return this
            .setHeader("Access-Control-Allow-Origin", allowedOrigins)
            .setHeader("Access-Control-Allow-Methods", allowedMethods.join(", "))
            .setHeader("Access-Control-Allow-Headers", allowedHeaders.join(", "))
    }

    public build(): Readonly<ResponseInf> {
        return {
            code: this.code === "auto" ? this.body === null ? 204 : 200 : this.code,
            body: this.body,
            headers: this.headers
        }
    }

    public static redirectResponse(newLocation: string, isPermanentRedirect: boolean = false): Readonly<ResponseInf> {
        const headers = new Map()
        headers.set("Location", newLocation)
        return {
            code: isPermanentRedirect ? 308 : 307,
            body: null,
            headers: headers
        }
    }
}
