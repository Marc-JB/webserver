export * from "./Async"
export * from "./MapTransform"
export * from "./Lazy"
export * from "./Observable"

export type Json = string | number | boolean | null | { [property: string]: Json } | Json[]

export interface JSObject {
    toJSON?: () => Json
    toString?: () => string
}
