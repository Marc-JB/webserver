import { Controller, ControllerAction } from "../internal";
import { JsonObject, http } from "..";

/**
 * Registeres the method as listener to requests with the given HTTP method on the given route
 * @param method the HTTP method to register this method to
 * @param route the route to register this method to
 */
export function HttpAction(method: http.Method, route: string = "/"){
    return (target: JsonObject, functionName: string) => 
        new Controller(target).addAction(new ControllerAction(functionName, method, route))
}

/**
 * Registeres the method as listener to GET requests on the given route
 * @param route the route to register this method to
 */
export function Get(route: string = "/") {
    return HttpAction("GET", route)
}

/**
 * Registeres the method as listener to POST requests on the given route
 * @param route the route to register this method to
 */
export function Post(route: string = "/") {
    return HttpAction("POST", route)
}

/**
 * Registeres the method as listener to PUT requests on the given route
 * @param route the route to register this method to
 */
export function Put(route: string = "/") {
    return HttpAction("PUT", route)
}

/**
 * Registeres the method as listener to PATCH requests on the given route
 * @param route the route to register this method to
 */
export function Patch(route: string = "/") {
    return HttpAction("PATCH", route)
}

/**
 * Registeres the method as listener to DELETE requests on the given route
 * @param route the route to register this method to
 */
export function Delete(route: string = "/") {
    return HttpAction("DELETE", route)
}

/**
 * Registeres the method as listener to OPTIONS requests on the given route
 * @param route the route to register this method to
 */
export function Options(route: string = "/") {
    return HttpAction("OPTIONS", route)
}