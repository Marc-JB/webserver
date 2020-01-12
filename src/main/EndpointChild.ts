import { EndpointParent } from "./EndpointParent"
import { HttpRequest } from "./request/HttpRequest";
import { ResponseInf, ReadonlyResponseInf } from "./response/ResponseInf";

export interface EndpointChild {
    readonly fullPath: string
    readonly parent: EndpointParent | null
    onRequest(url: string, request: HttpRequest): Promise<ReadonlyResponseInf | ResponseInf | null>
}
