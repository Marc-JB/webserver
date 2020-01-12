import { UrlWithParsedQuery as Url } from "url"

export { Url }

export interface UrlWithParams extends Url {
    readonly params: ReadonlyMap<string, string>
}
