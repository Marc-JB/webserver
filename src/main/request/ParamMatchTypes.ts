export interface ParamMatchInf {
    /** Returns an array of param keys for the given url string */
    keyMatcher(q: string): string[]

    /** Returns a string with all keys replaced as regexp matchers */
    valueMatcher(q: string): string
}

export class ParamMatchTypes {
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
