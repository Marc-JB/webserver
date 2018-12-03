import Response from "../Response"

export default class Created implements Response {
    public statusCode: number = 201

    constructor(public body: object | object[]){}
}