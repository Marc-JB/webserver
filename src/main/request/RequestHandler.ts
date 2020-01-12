import { AsyncRequestHandlerCallback } from "../Endpoint"
import { HttpRequest } from "./HttpRequest"
import { ParamMatchType, ParamMatchTypes } from "./ParamMatchTypes"
import { EndpointChild } from "../EndpointChild"
import { EndpointParent } from "../EndpointParent"
import { ResponseInf, ReadonlyResponseInf } from "../response/ResponseInf"
import { Url } from "../Url"

/**
 * This matches the query/anchor part of the url. Will also match if there's no query or anchor.
 */
const regExpMatchUrlQueryAndAnchor = "((\\?|#).*|)"

function createRegExp(regExpString: string, matchType: "full" | "global" | "default" = "default"): RegExp {
    return matchType === "global" ? new RegExp(regExpString, "g") : new RegExp(matchType === "full" ? `^${regExpString}$` : regExpString)
}

const urlValueMatchRegExp = (path: string, paramMatchType: ParamMatchType) =>
    createRegExp(paramMatchType.valueMatcher(path).replace(/\//g, `\\/`) + regExpMatchUrlQueryAndAnchor, "full")

export class RequestHandler implements EndpointChild {
    public readonly path: string

    constructor(
        path: string,
        public readonly method: string,
        public readonly handler: AsyncRequestHandlerCallback,
        public readonly parent: EndpointParent | null = null,
        protected readonly paramMatchType: ParamMatchType = ParamMatchTypes.DEFAULT
    ){
        this.path = path.split("/").filter(it => it !== "").join("/")
    }

    /**
     * @returns the path this handler is attached to, including the path of its parent (and parent of its parent, etc.)
     */
    public get fullPath(): string {
        return ((this.parent?.fullPath ?? "") + "/" + this.path).split("/").filter(it => it !== "").join("/")
    }

    public isMatch(url: string): boolean {
        return urlValueMatchRegExp(this.fullPath, this.paramMatchType).test(url)
    }

    public getParams(url: string): ReadonlyMap<string, string> {
        if(!this.isMatch(url)) return new Map()

        const values = url.match(urlValueMatchRegExp(this.fullPath, this.paramMatchType)) ?? []
        const params: Map<string, string> = new Map()

        this.paramMatchType.keyMatcher(this.fullPath)
            .map(key => key.substring(1, key.length - 1))
            .forEach((key, i) => params.set(key, values[i + 1]))

        return params
    }

    public toJSON() {
        return `${this.method}: /${this.path}`
    }

    public async onRequest(url: string, request: HttpRequest): Promise<ReadonlyResponseInf | ResponseInf | null> {
        let responseObject: ReadonlyResponseInf | ResponseInf | null = null

        if (this.isMatch(url) && (this.method === "*" || request.method.toUpperCase() === this.method)) {
            const requestUrl = (request.url as Url & { params: Map<string, string> })

            for(const [key, value] of this.getParams(url))
                requestUrl.params.set(key, value)

            responseObject = await this.handler(request)
            requestUrl.params.clear()
        }

        return responseObject
    }
}
