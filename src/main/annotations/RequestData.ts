import { Controller, ControllerActionParam } from "../internal";
import { JsonObject } from "..";

/**
 * The request body as string, json or null/undefined
 */
export function Body() {
    return (target: JsonObject, methodName: string, index: number) => 
        new Controller(target).addParam(methodName, new ControllerActionParam(index, "Body"))
}

/**
 * Retrieve a query param
 * @param name the name of the query param
 */
export function Query(name: string) {
    return (target: JsonObject, methodName: string, index: number) => 
        new Controller(target).addParam(methodName, new ControllerActionParam(index, "Query", name))
}

/**
 * Retrieve an URL param
 * @param name The name of the param
 */
export function Param(name: string) {
    return (target: JsonObject, methodName: string, index: number) => 
        new Controller(target).addParam(methodName, new ControllerActionParam(index, "Param", name))
}

/**
 * A shorthand for @Param("id")
 */
export function ID() {
    return Param("id")
}

/**
 * Retrieve the authentication object
 * Defaults to null, unless an authentication middleware was added
 */
export function Auth() {
    return (target: JsonObject, methodName: string, index: number) => 
        new Controller(target).addParam(methodName, new ControllerActionParam(index, "Auth"))
}