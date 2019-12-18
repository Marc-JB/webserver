import { ResponseInf } from "./Endpoint"

export class ResponseBuilder {
    public code: number = 200
    public body: string | null = null
    public readonly headers: Map<string, number | string | string[]> = new Map()

    public setStatus(status: number): this {
        this.code = status

        return this
    }

    public setBody(body: string | Object | null, inferContentType = false): this {
        if(body === null) {
            this.body = null
            this.headers.delete("Content-Type")
        } else if (typeof body === "string") {
            if(inferContentType) {
                this.setHeader("Content-Type", body.trim().toLowerCase().startsWith("<!doctype html>") ? "text/html" : "text/plain")
            }

            this.body = body
        } else {
            if(inferContentType) {
                this.setHeader("Content-Type", "application/json;charset=UTF-8")
            }

            this.body = JSON.stringify(body)
        }

        return this
    }

    public setHeader(key: string, value: number | string | string[]): this {
        this.headers.set(key, value)

        return this
    }

    public setCORS(allowedOrigins: string = "*", allowedMethods: string[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: string[] = ["X-Requested-With", "Content-Type"]): this {
        this.setHeader("Access-Control-Allow-Origin", allowedOrigins)
        this.setHeader("Access-Control-Allow-Methods", allowedMethods.join(", "))
        this.setHeader("Access-Control-Allow-Headers", allowedHeaders.join(", "))

        return this
    }

    public build(): ResponseInf {
        return {
            code: this.code,
            body: this.body,
            headers: this.headers
        }
    }
}
