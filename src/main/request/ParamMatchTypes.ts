export interface ParamMatchType {
    /** Returns an array of param keys for the given url string */
    keyMatcher(q: string): string[]

    /** Returns a string with all keys replaced as regexp matchers */
    valueMatcher(q: string): string
}

export class ParamMatchTypes {
    static get NONE(): ParamMatchType {
        return new class implements ParamMatchType {
            keyMatcher = (_: string): string[] => []
            valueMatcher = (q: string): string => q
        }()
    }

    /** Default param resolver, put params between `{` and `}` (like: `/books/{id}/`) */
    static get DEFAULT(): ParamMatchType {
        return new class implements ParamMatchType {
            keyMatcher = (q: string): string[] => q.match(/{([^\/{}]+)}/g) ?? []
            valueMatcher = (q: string): string => q.replace(/{[^\/{}]+}/g, `([^\/]+)`)
        }()
    }

    /** Express.js-style param resolver, put params behind a `:` (like: `/books/:id/`) */
    static get EXPRESSJS(): ParamMatchType {
        return new class implements ParamMatchType {
            keyMatcher = (q: string): string[] => q.match(/:([^\/:]+)/g) ?? []
            valueMatcher = (q: string): string => q.replace(/:[^\/:]+/g, `([^\/]+)`)
        }()
    }
}
