import Response from "../Response"

export default class OK implements Response {
    public statusCode: number = 200

    constructor(public body: object | object[]){}
}