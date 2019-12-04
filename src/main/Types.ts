import { Endpoint } from "./Endpoint";

export interface EndpointParent {
    readonly childEndpoints: Set<Endpoint>
    fullPath: string
    createEndpointAtPath(path: string): Endpoint
    // removeEndpointAtPath(path: string): void
    // removeEndpoint(endpoint: Endpoint): void
    // getEndpointAtPath(path: string): Endpoint | null
}
