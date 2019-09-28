import { JsonObject, RequestHandlerCallback, http } from "../index";
import { ControllerActionParam } from "./index";

export class ControllerAction {
    public params: ControllerActionParam[] = []

    constructor(public functionName: string, public httpMethod?: http.Method, public route?: string){}

    public asHandler(controller: JsonObject): RequestHandlerCallback {
        return async request => {
            let params: (Promise<any> | any)[] = this.params
                .sort((a, b) => a.index - b.index)
                .map(param => param.getValue(request))
            params = await Promise.all(params)
            return controller[this.functionName](...params)
        }
    }
}