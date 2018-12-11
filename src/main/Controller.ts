type PromiseLike<T> = T | Promise<T>
type json = {[key: string]: any}

/**
 * An basic controller suitable for basic RESTful resources.
 * All actions (get, getAll, create, ...) are optional and will throw a 404 Not Found when not implemented.
 * Authentication is optional.
 */
export default interface Controller<Model extends object = json, Auth = any> {
    /**
     * The value of this property will be the endpoint name.
     * For example: with a value of "products", the endpoint will be /api/v1/products/
     */
    resourceName: string

    get?: (id: string, params: json, auth?: Auth) => PromiseLike<Model>
    getAll?: (params: json, auth?: Auth) => PromiseLike<Model[]>
    create?: (model: json, params: json, auth?: Auth) => PromiseLike<Model>
    update?: (id: string, model: json, params: json, auth?: Auth) => PromiseLike<void>
    updateAll?: (model: json, params: json, auth?: Auth) => PromiseLike<void>
    delete?: (id: string, params: json, auth?: Auth) => PromiseLike<void>
    deleteAll?: (params: json, auth?: Auth) => PromiseLike<void>
}