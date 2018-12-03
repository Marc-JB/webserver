import Response from "../Response"

export default class NoContent implements Response {
    public statusCode: number = 204
    public body: null = null
}