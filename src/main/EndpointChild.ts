import { HttpRequest } from "./request/HttpRequest";
import { ResponseInf, ReadonlyResponseInf } from "./response/ResponseInf";
import { Endpoint } from "./Endpoint";
import { JSObject, Json } from "../../lib/main";

export interface EndpointChild extends JSObject {
    readonly fullPath: string
    readonly parent: Endpoint | null
    onRequest(url: string, request: HttpRequest): Promise<ReadonlyResponseInf | ResponseInf | null>
    toJSON(): Json
}
