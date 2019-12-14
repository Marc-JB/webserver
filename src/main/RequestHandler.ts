import { AsyncRequestHandlerCallback, Endpoint, ResponseObjectType } from "./Endpoint"
import { HttpRequestInfWithParams } from "./HttpRequestInf"

const urlValueMatchRegExp = (path: string) =>
    new RegExp("^" + path.replace(/{[^\/{}]+}/g, `([^\/]+)`).replace(/\//g, `\\/`) + "(\\?.*|)$")

const urlKeyMatchRegExp = /{([^\/{}]+)}/g

export class RequestHandler {
    constructor(
        public readonly path: string,
        public readonly method: string,
        public readonly handler: AsyncRequestHandlerCallback,
        public readonly parent: Endpoint
    ){}

    /**
     * @returns the path this handler is attached to, including the path of its parent (and parent of its parent, etc.)
     */
    public get fullPath(): string {
        const parentPath = this.parent.fullPath.split("/").filter(it => it !== "").join("/")
        const thisPath = this.path.split("/").filter(it => it !== "").join("/")
        return parentPath + "/" + thisPath
    }

    public async invoke(request: Readonly<HttpRequestInfWithParams>): Promise<ResponseObjectType> {
        return this.handler(request)
    }

    public isMatch(url: string): boolean {
        return urlValueMatchRegExp(this.fullPath).test(url)
    }

    public getParams(url: string): ReadonlyMap<string, string> {
        if(!this.isMatch(url)) return new Map()

        const values = url.match(urlValueMatchRegExp(this.fullPath)) ?? []
        const params: Map<string, string> = new Map()

        this.fullPath.match(urlKeyMatchRegExp)
            ?.map(key => key.substring(1, key.length - 1))
            ?.forEach((key, i) => params.set(key, values[i + 1]))

        return params
    }
}
