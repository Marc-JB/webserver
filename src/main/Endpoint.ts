import { Async } from "../../lib/main/index"
import { EndpointParent } from "./EndpointParentInf"
import { HttpRequestInf, ReadonlyHttpRequestInf } from "./request/HttpRequestInf"
import { RequestHandler } from "./request/RequestHandler"
import { UrlWithParsedQuery } from "url"

export interface ResponseInf extends ReadonlyResponseInf {
    code: number
    body: string | null
    headers: Map<string, number | string | string[]>
}

export interface ReadonlyResponseInf {
    readonly code: number
    readonly body: string | null
    readonly headers: ReadonlyMap<string, number | string | string[]>
}

export type RequestHandlerCallback = (request: ReadonlyHttpRequestInf) => Async.MaybeAsync<ResponseInf | null>
export type AsyncRequestHandlerCallback = (request: ReadonlyHttpRequestInf) => Promise<ResponseInf | null>

export class Endpoint implements EndpointParent {
    public readonly path: string
    public readonly handlers: Set<RequestHandler> = new Set()
    public readonly childEndpoints: Set<Endpoint> = new Set()
    public readonly requestMiddleware: Set<((request: HttpRequestInf) => Promise<void>)> = new Set()
    public readonly responseMiddleware: Set<((request: ReadonlyHttpRequestInf, response: ResponseInf | null) => Promise<ResponseInf | null>)> = new Set()

    constructor(path: string, public readonly parent: EndpointParent){
        this.path = path.split("/").filter(it => it !== "").join("/")
    }

    /**
     * The full path to this endpoint, including the path of parent endpoints (if any)
     * @returns a string, containing the path, with "/" slashes. "/" characters on the beginning and end of the path are removed
     */
    public get fullPath(): string {
        return (this.parent.fullPath + "/" + this.path).split("/").filter(it => it !== "").join("/")
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
     * Registeres a request for the given method on the given route on this endpoint
     * @param method the HTTP method to register the handler on
     * @param route the route of the request, relative to the endpoint
     * @param handler a function that takes the request and returns a response or throws an error
     */
    public attachHandler(method: string, route: string, handler: RequestHandlerCallback){
        this.handlers.add(new RequestHandler(route, method, Async.wrapInPromise(handler), this))
    }

    /**
     * Creates a new endpoint and attaches it to this endpoint on the given route
     * @param route The route to register the endpoint on
     * @returns the new endpoint that was created
     */
    public createEndpointAtPath(route: string): Endpoint {
        const endpoint = new Endpoint(route, this)
        this.childEndpoints.add(endpoint)
        return endpoint
    }

    /**
     * Adds the middleware to this endpoint
     * @param middleware a function that takes a request and modifies it
     */
    public addRequestMiddleware(middleware: (request: HttpRequestInf) => void | Promise<void>){
        this.requestMiddleware.add(Async.wrapInPromise(middleware))
    }

    /**
     * Adds the middleware to this endpoint
     * @param middleware a function that takes a request and modifies it
     */
    public addResponseMiddleware(middleware: (request: ReadonlyHttpRequestInf, response: ResponseInf | null) => Async.MaybeAsync<ResponseInf | null>){
        this.responseMiddleware.add(Async.wrapInPromise(middleware))
    }

    public async onRequest(url: string, request: HttpRequestInf): Promise<ResponseInf | null> {
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

        /** */
        let responseObject: ResponseInf | null = null

        // Request middleware
        for (const requestMiddleware of this.requestMiddleware)
            await requestMiddleware(request)

        // Loop trough child endpoints to check if they have a reponse ready
        for(const endpoint of this.childEndpoints) {
            if(url.startsWith(endpoint.fullPath)) {
                const r = await endpoint.onRequest(url, request)
                if(r !== null) {
                    if(responseObject !== null)
                        throw new Error(`${url} is registered on 2 different endpoints!`)

                    responseObject = r
                }
            }
        }

        // Loop trough own handlers to check if they have a response ready
        for(const handler of this.handlers) {
            if (handler.isMatch(url) && request.method.toUpperCase() === handler.method) {
                if(responseObject !== null)
                    throw new Error(`[${request.method.toUpperCase()}: ${url}] is registered 2 times!`)

                const requestUrl = (request.url as UrlWithParsedQuery & { params: Map<string, string> })

                for(const [key, value] of handler.getParams(url))
                    requestUrl.params.set(key, value)

                responseObject = await handler.invoke(request)
                requestUrl.params.clear()
            }
        }

        // Response middleware
        for(const responseMiddleware of this.responseMiddleware) {
            /**
             * The following null check was placed inside the loop,
             * because the middleware that is called here can return null,
             * thus modifying the responseObject to be null.
             */
            const r = await responseMiddleware(request, responseObject)
            if(r !== null)
                responseObject = r
        }

        return responseObject
    }

    public toJSON(): object {
        return {
            path: `/${this.path}`,
            middleware: {
                request: this.requestMiddleware.size,
                response: this.responseMiddleware.size
            },
            childHandlers: Array.from(this.handlers).map(it => it.toJSON()),
            childEndpoints: Array.from(this.childEndpoints).map(it => it.toJSON())
        }
    }
}
