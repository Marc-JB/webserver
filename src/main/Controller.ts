type PromiseLike<T> = T | Promise<T>
type json = {[key: string]: any}

export default interface Controller<Model extends object> {
    resourceName: string

    get(id: string, params: json): PromiseLike<Model>

    getAll(params: json): PromiseLike<Model[]>

    create(model: json, params: json): PromiseLike<Model>

    update(id: string, model: json, params: json): PromiseLike<void>

    updateAll(model: json, params: json): PromiseLike<void>

    delete(id: string, params: json): PromiseLike<void>

    deleteAll(params: json): PromiseLike<void>
}