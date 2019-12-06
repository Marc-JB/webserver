import { Endpoint, AsyncRequestHandlerCallback } from "./index";
import { ResponseObjectType } from "./Endpoint";
import { HttpRequestInfWithParams } from "./HttpRequestInf";

export class RequestHandler {
    constructor(
        public readonly path: string,
        public readonly method: string,
        public readonly handler: AsyncRequestHandlerCallback,
        public readonly parent: Endpoint
    ){}

    public get fullPath(): string {
        const parentPath = this.parent.fullPath.split("/").filter(it => it !== "").join("/")
        const thisPath = this.path.split("/").filter(it => it !== "").join("/")
        return parentPath + "/" + thisPath
    }

    public async invoke(request: Readonly<HttpRequestInfWithParams>): Promise<ResponseObjectType> {
        return this.handler(request)
    }

    public matchUrl(url: string): { matches: false } | { matches: true, params: { [key: string]: string } } {
        const urlMatches = url.match(new RegExp("^" + this.fullPath.replace(/{[^\/{}]+}/g, `([^\/]+)`).replace(/\//g, `\\/`) + "(\\?.*|)$"))
        if(!urlMatches) return { matches: false }

        const matches = this.fullPath.match(/{([^\/{}]+)}/g) || []
        const params: { [key: string]: string } = {}

        matches.map(match => match.substring(1, match.length - 1)).forEach((match, i) => params[match] = urlMatches[i + 1])

        return { matches: true, params }
    }
}
