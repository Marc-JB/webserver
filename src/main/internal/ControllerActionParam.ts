import { Request } from ".."

export class ControllerActionParam {
    public readonly type: "Body" | "Auth" | "Query" | "Param"
    public readonly name?: string

    constructor(public index: number, ...args: ["Body" | "Auth"] | ["Query" | "Param", string]){
        this.type = args[0]
        this.name = args[1]
    }

    public getValue(request: Request){
        switch(this.type){
            case "Body": return request.body
            case "Query": return request.query[this.name as string]
            case "Param": return request.params[this.name as string]
            case "Auth": return request.authentication
            default: return null
        }
    }
}