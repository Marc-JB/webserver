import Response from "../Response"

/**
 * The 201 Created HTTP status.
 * Similar to 200 OK, but this indicates that a resource was created.
 */
export default class Created implements Response {
    public statusCode: number = 201

    constructor(public body: object | object[]){}
}