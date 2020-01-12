import { HttpRequest } from "./request/HttpRequest";
import { ResponseInf, ReadonlyResponseInf } from "./response/ResponseInf";
import { Endpoint } from "./Endpoint";

export interface EndpointChild {
    readonly fullPath: string
    readonly parent: Endpoint | null
    onRequest(url: string, request: HttpRequest): Promise<ReadonlyResponseInf | ResponseInf | null>
}
