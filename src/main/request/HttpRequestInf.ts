import { UrlWithParams } from "./UrlWithParams"

export interface ReadonlyHttpRequestInf {
    readonly url: UrlWithParams
    readonly method: string

    readonly headers: ReadonlyMap<string, string | string[]>
    /**
     * True if a Save-Data: on header is sent,
     * False if a Save-Data: off header is sent,
     * Null if no DNT header was sent
     */
    readonly dataSaverEnabled: boolean | null
    /**
     * True if a DNT: 1 header is sent (don't track me),
     * False if a DNT: 0 header is sent (track me),
     * Null if no DNT header was sent (no choice made)
     */
    readonly doNotTrackEnabled: boolean | null

    readonly body: Promise<string | null>

    /**
     * An authentication object
     * Defaults to *null*, add an authentication middleware to change the value
     */
    readonly authentication: any

    /** Options passed trough by middleware. */
    readonly options: ReadonlyMap<string, any>
}

export interface HttpRequestInf extends ReadonlyHttpRequestInf {
    authentication: any
    readonly options: Map<string, any>
}
