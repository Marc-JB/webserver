import { Json, http } from "../index";

export type HttpResponse = {
    writeHead(code: number): any
    end(body?: string): any
    setHeader(key: string, value: number | string | string[]): any
}

export class Response {
    protected statusCode?: number

    constructor(protected readonly response: HttpResponse){}

    public status(status: number){
        this.statusCode = status
        return this
    }

    public send(body?: string | Json, status?: number, contentType?: string){
        this.setCORS()
        if(body){
            if(contentType){
                this.setHeader("Content-Type", contentType)
            } else if(typeof body !== "string"){
                this.setHeader("Content-Type", "application/json;charset=UTF-8")
            } else if (body.toLowerCase().startsWith("<!doctype html>")){
                this.setHeader("Content-Type", "text/html")
            }
        }
        this.response.writeHead(this.statusCode || status || 200)
        this.response.end(body ? typeof body == "string" ? body : JSON.stringify(body) : body)
    }

    public setHeader(key: string, value: number | string | string[]){
        this.response.setHeader(key, value)
    }

    public setCORS(allowedOrigins: string = "*", allowedMethods: http.Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: string[] = ["X-Requested-With", "Content-Type"]){
        this.setHeader("Access-Control-Allow-Origin", allowedOrigins)
        this.setHeader("Access-Control-Allow-Methods", allowedMethods.join(", "))
        this.setHeader("Access-Control-Allow-Headers", allowedHeaders.join(", "))
    }

    public end(body?: string | Json, status?: number){
        this.send(body, status)
    }

    public json(json: Json, status?: number){
        this.send(json, status)
    }
}