import { http, Json, PromiseLike, StringUtils, Request, Response, JsonObject } from "../index";
import { Controller, RequestHandler } from "../internal/index";
import { Exception } from "@peregrine/exceptions";

export type RequestHandlerCallback = (request: Request) => PromiseLike<{ code: number, body?: string | Json }>

export class Endpoint {
    public handlers: RequestHandler[] = []
    public children: Endpoint[] = []
    public requestMiddleware: ((request: Request) => void | Promise<void>)[] = []

    constructor(
        public readonly path: string, 
        public readonly parent?: Endpoint
    ){}

    /**
     * The full path to this endpoint, including the path of parent endpoints (if any)
     * @returns a string, containing the path, with "/" slashes. "/" characters on the beginning and end of the path are removed
     */
    public get fullPath(): string {
        const parentPath = StringUtils.removeEnds(this.parent ? this.parent.fullPath : "", "/")
        const thisPath = StringUtils.removeEnds(this.path, "/")
        return StringUtils.removeEnds(parentPath + "/" + thisPath, "/")
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
    public attachHandler(method: http.Method, route: string, handler: RequestHandlerCallback){
        this.handlers.push(new RequestHandler(route, method, handler, this))
    }

    /**
     * Creates a new endpoint and attaches it to this endpoint on the given route
     * @param route The route to register the endpoint on
     * @returns the new endpoint that was created
     */
    public route(route: string): Endpoint {
        const endpoint = new Endpoint(route, this)
        this.children.push(endpoint)
        return endpoint
    }

    /**
     * Registeres the given controller to this endpoint
     */
    public addController(...args: [string, JsonObject] | [JsonObject]){
        let controller: JsonObject
        let route: string
        if(typeof args[0] == "string" && args[1]){
            route = args[0]
            controller = args[1]
        } else if(typeof args[0] == "object"){
            controller = args[0]
            route = ""
        } else {
            throw new Exception("Invalid parameter type passed")
        }
        const controllerWrapper = new Controller(controller as {[key: string]: any})
        const app = this.route(`${StringUtils.removeEnds(route, "/")}/${StringUtils.removeEnds(controllerWrapper.route, "/")}`)
        const actions = controllerWrapper.getActions()
        actions.forEach(action => app.attachHandler(action.httpMethod, action.route, action.asHandler(controller)))
    }

    /**
     * Adds the middleware to this endpoint
     * @param middleware a function that takes a request and modifies it
     */
    public addRequestMiddleware(middleware: (request: Request) => void | Promise<void>){
        this.requestMiddleware.push(middleware)
    }

    /**
     * Adds the authentication middleware tot this endpoint
     * @param middleware a function that takes a request and returns the authentication object (like a user, admin, token)
     */
    public addAuthenticationMiddleware(middleware: (request: Request) => any | Promise<any>){
        this.addRequestMiddleware(async request => {
            request.authentication = await middleware(request)
        })
    }

    protected async onRequest(url: string, request: Request, response: Response){
        await Promise.all(this.requestMiddleware.map(it => it(request)))

        this.handlers.forEach(async it => {
            const matchResult = it.matchUrl(url)
            if(matchResult.matches && request.method.toUpperCase() == it.method){
                request.params = matchResult.params
                const responseObject = await it.invoke(request)
                response.send(responseObject.body, responseObject.code)
            }
        })

        this.children
            .filter(it => url.startsWith(it.fullPath))
            .forEach(it => it.onRequest(url, request, response))
    }
}