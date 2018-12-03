type PromiseLike<T> = T | Promise<T>

export default interface Controller<T extends object> {
    resourceName: string

    get(id: number, params?: object): PromiseLike<T>

    getAll(params?: object): PromiseLike<T[]>

    create(model: object, params?: object): PromiseLike<T>

    update(id: number, model: T, params?: object): PromiseLike<void>

    updateAll(model: object, params?: object): PromiseLike<void>

    delete(id: number, params?: object): PromiseLike<void>

    deleteAll(params?: object): PromiseLike<void>
}