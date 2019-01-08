import { Controller as C } from "../internal";
import { BaseClass, JsonObject } from "..";

/**
 * Registeres the class as controller
 * @param baseRoute the route to this controller
 */
export function Controller(baseRoute: string = "/") {
    return (target: BaseClass<JsonObject>) => { new C(target.prototype).route = baseRoute }
}

/**
 * Registeres the class as a RESTful resource controller
 * @param resourceName the name of the resource (people, students, customers, etc.)
 */
export function Resource(resourceName: string) {
    return Controller(`/${resourceName}/`)
}