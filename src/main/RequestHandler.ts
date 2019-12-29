import { AsyncRequestHandlerCallback, Endpoint, ResponseInf } from "./Endpoint"
import { HttpRequestInfWithParams } from "./HttpRequestInf"

interface ParamMatchInf {
    /** Returns an array of param keys for the given url string */
    keyMatcher(q: string): string[]

    /** Returns a string with all keys replaced as regexp matchers */
    valueMatcher(q: string): string
}

class ParamMatchTypes {
    static get NONE(): ParamMatchInf {
        return new class implements ParamMatchInf {
            keyMatcher(_: string): string[] { return [] }

            valueMatcher(q: string): string { return q }
        }()
    }

    /**
     * Default param resolver, put params between `{` and `}` (like: `/books/{id}/`)
     */
    static get DEFAULT(): ParamMatchInf {
        return new class implements ParamMatchInf {
            keyMatcher(q: string): string[] {
                return q.match(/{([^\/{}]+)}/g) ?? []
            }

            valueMatcher(q: string): string {
                return q.replace(/{[^\/{}]+}/g, `([^\/]+)`)
            }
        }()
    }

    /**
     * Express.js-style param resolver, put params behind a `:` (like: `/books/:id/`)
     */
    static get EXPRESSJS(): ParamMatchInf {
        return new class implements ParamMatchInf {
            keyMatcher(q: string): string[] {
                return q.match(/:([^\/:]+)/g) ?? []
            }

            valueMatcher(q: string): string {
                return q.replace(/:[^\/:]+/g, `([^\/]+)`)
            }
        }()
    }
}

/**
 * This matches the query/anchor part of the url. Will also match if there's no query or anchor.
 */
const regExpMatchUrlQueryAndAnchor = "((\\?|#).*|)"

function createRegExp(regExpString: string, matchType: "full" | "global" | "default" = "default"): RegExp {
    return matchType === "global" ? new RegExp(regExpString, "g") : new RegExp(matchType === "full" ? `^${regExpString}$` : regExpString)
}

const urlValueMatchRegExp = (path: string, paramMatchType: ParamMatchInf) =>
    createRegExp(paramMatchType.valueMatcher(path).replace(/\//g, `\\/`) + regExpMatchUrlQueryAndAnchor, "full")

export class RequestHandler {
    constructor(
        public readonly path: string,
        public readonly method: string,
        public readonly handler: AsyncRequestHandlerCallback,
        public readonly parent: Endpoint,
        protected readonly paramMatchType: ParamMatchInf = ParamMatchTypes.DEFAULT
    ){}

    /**
     * @returns the path this handler is attached to, including the path of its parent (and parent of its parent, etc.)
     */
    public get fullPath(): string {
        const parentPath = this.parent.fullPath.split("/").filter(it => it !== "").join("/")
        const thisPath = this.path.split("/").filter(it => it !== "").join("/")
        return (parentPath + "/" + thisPath).split("/").filter(it => it !== "").join("/")
    }

    public async invoke(request: Readonly<HttpRequestInfWithParams>): Promise<ResponseInf | null> {
        return this.handler(request)
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
}
