import { Endpoint, RequestHandlerCallback, http, StringUtils, Json, Request } from "..";

export class RequestHandler {
    constructor(
        public readonly path: string, 
        public readonly method: http.Method, 
        public readonly handler: RequestHandlerCallback,
        public readonly parent: Endpoint
    ){}

    public get fullPath(): string {
        const parentPath = StringUtils.removeEnds(this.parent.fullPath, "/")
        const thisPath = StringUtils.removeEnds(this.path, "/")
        return StringUtils.removeEnds(parentPath + "/" + thisPath, "/")
    }

    public async invoke(request: Request): Promise<{code: number, body?: string | Json}> {
        try {
            const result = await this.handler(request)
            return result && result.code && result.body ? result : result ? { code: 200, body: result } : { code: 204 }
        } catch (error) {
            return {
                code: error.code && typeof error.code == "number" && error.code >= 400 && error.code < 600 ? error.code : 500,
                body: {
                    code: error.code || 500,
                    error: error
                }
            }
        }
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