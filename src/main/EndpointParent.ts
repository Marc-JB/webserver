import { Endpoint } from "./Endpoint"
import { HttpRequest } from "./request/HttpRequest";
import { ResponseInf, ReadonlyResponseInf } from "./response/ResponseInf";

export interface EndpointParent {
    readonly childEndpoints: ReadonlySet<Endpoint>
    readonly fullPath: string
    createEndpointAtPath(path: string): Endpoint
    onRequest(url: string, request: HttpRequest): Promise<ReadonlyResponseInf | ResponseInf | null>
}

export async function requestCheckOnChildEndpoint(thisEndpoint: EndpointParent, url: string, request: HttpRequest): Promise<ReadonlyResponseInf | ResponseInf | null> {
    let responseObject: ReadonlyResponseInf | ResponseInf | null = null

    // Loop trough child endpoints to check if they have a reponse ready
    for(const endpoint of thisEndpoint.childEndpoints) {
        if(url.startsWith(endpoint.fullPath)) {
            const r = await endpoint.onRequest(url, request)
            if(r !== null) {
                if(responseObject !== null)
                    throw new Error(`${url} is registered on 2 different endpoints!`)

                responseObject = r
            }
        }
    }

    return responseObject
}
