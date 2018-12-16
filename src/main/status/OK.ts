import Response from "../Response"

/**
 * The 200 OK HTTP status.
 * Indicates the request was handled correctly.
 */
export default class OK implements Response {
    public statusCode: number = 200

    constructor(public body: object | object[]){}
}