import Response from "../Response"

/**
 * The 204 NoContent HTTP status.
 * This is like 200 OK, but without a content body to return
 */
export default class NoContent implements Response {
    public statusCode: number = 204
    public body: null = null
}