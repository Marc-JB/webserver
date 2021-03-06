import { Async, Json } from "../../lib/main/index"
import { HttpRequest, ReadonlyHttpRequest } from "./request/HttpRequest"
import { RequestHandler } from "./request/RequestHandler"
import { EndpointChild } from "./EndpointChild"
import { ResponseInf, ReadonlyResponseInf } from "./response/ResponseInf"

export type RequestMiddleware = (request: HttpRequest) => Async.MaybeAsync<void>
export type AsyncRequestMiddleware = (request: HttpRequest) => Promise<void>

export type ResponseMiddleware = (request: ReadonlyHttpRequest, response: ResponseInf | null) => Async.MaybeAsync<ReadonlyResponseInf | ResponseInf | null>
export type AsyncResponseMiddleware = (request: ReadonlyHttpRequest, response: ResponseInf | null) => Promise<ReadonlyResponseInf | ResponseInf | null>

export type RequestHandlerCallback = (request: ReadonlyHttpRequest) => Async.MaybeAsync<ReadonlyResponseInf | ResponseInf | null>
export type AsyncRequestHandlerCallback = (request: ReadonlyHttpRequest) => Promise<ReadonlyResponseInf | ResponseInf | null>

export class Endpoint implements EndpointChild {
    public readonly path: string
    public readonly children: Set<EndpointChild> = new Set()
    public readonly requestMiddleware: Set<AsyncRequestMiddleware> = new Set()
    public readonly responseMiddleware: Set<AsyncResponseMiddleware> = new Set()

    constructor(path: string, public readonly parent: Endpoint | null = null){
        this.path = path.split("/").filter(it => it !== "").join("/")
    }

    /**
     * The full path to this endpoint, including the path of parent endpoints (if any)
     * @returns a string, containing the path, with "/" slashes. "/" characters on the beginning and end of the path are removed
     */
    public get fullPath(): string {
        return ((this.parent?.fullPath ?? "") + "/" + this.path).split("/").filter(it => it !== "").join("/")
    }

    /**
     * Registers a GET request on the given route on this endpoint
     * @param route the route of the request, relative to the endpoint
     * @param handler a function that takes the request and returns a response or throws an error
     * @returns this endpoint
     */
    public get(route: string, handler: RequestHandlerCallback){
        this.attachHandler("GET", route, handler)
        return this
    }

    /**
     * Registers a POST request on the given route on this endpoint
     * @param route the route of the request, relative to the endpoint
     * @param handler a function that takes the request and returns a response or throws an error
     * @returns this endpoint
     */
    public post(route: string, handler: RequestHandlerCallback){
        this.attachHandler("POST", route, handler)
        return this
    }

    /**
     * Registers a PUT request on the given route on this endpoint
     * @param route the route of the request, relative to the endpoint
     * @param handler a function that takes the request and returns a response or throws an error
     * @returns this endpoint
     */
    public put(route: string, handler: RequestHandlerCallback){
        this.attachHandler("PUT", route, handler)
        return this
    }

    /**
     * Registers a PATCH request on the given route on this endpoint
     * @param route the route of the request, relative to the endpoint
     * @param handler a function that takes the request and returns a response or throws an error
     * @returns this endpoint
     */
    public patch(route: string, handler: RequestHandlerCallback){
        this.attachHandler("PATCH", route, handler)
        return this
    }

    /**
     * Registers a DELETE request on the given route on this endpoint
     * @param route the route of the request, relative to the endpoint
     * @param handler a function that takes the request and returns a response or throws an error
     * @returns this endpoint
     */
    public delete(route: string, handler: RequestHandlerCallback){
        this.attachHandler("DELETE", route, handler)
        return this
    }

    /**
     * Registers a OPTIONS request on the given route on this endpoint
     * @param route the route of the request, relative to the endpoint
     * @param handler a function that takes the request and returns a response or throws an error
     * @returns this endpoint
     */
    public options(route: string, handler: RequestHandlerCallback){
        this.attachHandler("OPTIONS", route, handler)
        return this
    }

    /**
     * Registers a request on the given route on this endpoint for all methods
     * @param route the route of the request, relative to the endpoint
     * @param handler a function that takes the request and returns a response or throws an error
     * @returns this endpoint
     */
    public all(route: string, handler: RequestHandlerCallback){
        this.attachHandler("*", route, handler)
        return this
    }

    /**
     * Registeres a request for the given method on the given route on this endpoint
     * @param method the HTTP method to register the handler on
     * @param route the route of the request, relative to the endpoint
     * @param handler a function that takes the request and returns a response or throws an error
     */
    public attachHandler(method: string, route: string, handler: RequestHandlerCallback){
        this.children.add(new RequestHandler(route, method, Async.wrapInPromise(handler), this))
    }

    /**
     * Creates a new endpoint and attaches it to this endpoint on the given route
     * @param route The route to register the endpoint on
     * @returns the new endpoint that was created
     */
    public createEndpointAtPath(route: string): Endpoint {
        const endpoint = new Endpoint(route, this)
        this.children.add(endpoint)
        return endpoint
    }

    /**
     * Adds the middleware to this endpoint
     * @param middleware a function that takes a request and modifies it
     */
    public addRequestMiddleware(middleware: RequestMiddleware){
        this.requestMiddleware.add(Async.wrapInPromise(middleware))
    }

    /**
     * Adds the middleware to this endpoint
     * @param middleware a function that takes a request and modifies it
     */
    public addResponseMiddleware(middleware: ResponseMiddleware){
        this.responseMiddleware.add(Async.wrapInPromise(middleware))
    }

    public async onRequest(url: string, request: HttpRequest): Promise<ReadonlyResponseInf | ResponseInf | null> {
        if(!url.startsWith(this.fullPath))
            return null

        /**
         * Note that async functions in the function are not resolved in parallel.
         * This is because users can modify the execution order of middleware and handlers.
         *
         * Example:
         * ```
         * // Parses the "content-type" header into "json", "plain", "html", etc.
         * endpoint.addRequestMiddleware(contentTypeParserMiddleware)
         *
         * // Parses the body if the result of contentTypeParserMiddleware equals "json"
         * endpoint.addRequestMiddleware(jsonParserMiddleware)
         * ```
         * `jsonParserMiddleware` depends on the result of `contentTypeParserMiddleware`.
         * When using parallel execution, the result of `contentTypeParserMiddleware` might not
         * be available yet when `jsonParserMiddleware` requests it.
         */

        for (const requestMiddleware of this.requestMiddleware)
            await requestMiddleware(request)

        let responseObject: ReadonlyResponseInf | ResponseInf | null = null

        for(const handler of this.children)
            responseObject = responseObject ?? await handler.onRequest(url, request)

        for(const responseMiddleware of this.responseMiddleware)
            responseObject = (await responseMiddleware(request, responseObject as ResponseInf | null)) ?? responseObject

        return responseObject
    }

    public toJSON(): Json {
        return {
            path: `/${this.path}`,
            middleware: {
                request: this.requestMiddleware.size,
                response: this.responseMiddleware.size
            },
            children: Array.from(this.children).map(it => it.toJSON())
        }
    }
}
