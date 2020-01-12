import { UrlWithParams, Url } from "../Url"
import { ContentEncoding } from "../lib";
import { JSObject } from "../../../lib/main";

export interface ReadonlyHttpRequest extends JSObject {
    readonly url: UrlWithParams
    readonly method: string

    readonly headers: ReadonlyMap<string, string | string[]>
    /**
     * True if a Save-Data: on header is sent,
     * False if a Save-Data: off header is sent,
     * Null if no Save-Data header was sent
     */
    readonly dataSaverEnabled: boolean | null
    /**
     * True if a DNT: 1 header is sent (don't track me),
     * False if a DNT: 0 header is sent (track me),
     * Null if no DNT header was sent (no choice made)
     */
    readonly doNotTrackEnabled: boolean | null

    readonly userAgent: string | null
    readonly referer: Url | null
    readonly cookies: ReadonlyMap<string, string>
    readonly acceptedLanguages: ReadonlySet<[string, number]>
    readonly acceptedContentTypes: ReadonlySet<[string, number]>
    readonly acceptedContentEncodings: ReadonlySet<[ContentEncoding | "*", number]>
    readonly acceptedContentCharsets: ReadonlySet<[string, number]>

    readonly body: Promise<string | null>

    /** Options passed trough by request middleware */
    readonly customSettings: ReadonlyMap<string, any>
}

export interface HttpRequest extends ReadonlyHttpRequest {
    readonly customSettings: Map<string, any>
}
