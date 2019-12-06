import { Endpoint } from "./Endpoint"

export interface EndpointParent {
    readonly childEndpoints: Set<Endpoint>
    fullPath: string
    createEndpointAtPath(path: string): Endpoint
}
