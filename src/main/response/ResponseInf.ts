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
