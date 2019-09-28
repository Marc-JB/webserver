import net from "net"
import { TlsOptions } from "tls"
import { HttpRequest, HttpResponse } from "../index"

export type PromiseLike<T> = T | Promise<T>

export type BaseClass<T> = { prototype: T }

export type JsonObject = {[key: string]: any}
export type Json = JsonObject | any[]

export namespace http {
    export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS"

    export type UnsecuredHttpModule = (listener: (request: HttpRequest, response: HttpResponse) => void) => net.Server
    
    export type SecuredHttpModule = (options: TlsOptions, listener: (request: HttpRequest, response: HttpResponse) => void) => net.Server
}