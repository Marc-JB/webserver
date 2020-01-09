import { UrlWithParsedQuery } from "url"

export interface UrlWithParams extends UrlWithParsedQuery {
    readonly params: ReadonlyMap<string, string>
}
