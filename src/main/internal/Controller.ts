import { ArrayUtils } from "../index";
import { ControllerAction, ControllerActionParam } from "./index";

export class Controller {
    constructor(protected targetClass: { __actions__?: ControllerAction[], route?: string }){
        if(!targetClass.__actions__) 
            targetClass.__actions__ = []

        if(!targetClass.route)
            targetClass.route = "/"
    }

    protected get actions(){
        return this.targetClass.__actions__ || []
    }

    public set route(route: string){
        this.targetClass.route = route
    }

    public get route(): string {
        return this.targetClass.route || "/"
    }

    public addAction(action: ControllerAction){
        const storedAction = this.actions.find(it => it.functionName == action.functionName)
        if(storedAction){
            storedAction.params = ArrayUtils.largest(storedAction.params, action.params)
            storedAction.httpMethod = action.httpMethod || storedAction.httpMethod
            storedAction.route = action.route || storedAction.route
        } else {
            this.actions.push(action)
        }
    }

    public addParam(actionName: string, param: ControllerActionParam){
        if(!this.actions.some(it => it.functionName == actionName)){
            this.addAction(new ControllerAction(actionName))
        }
        const action = this.actions.find(it => it.functionName == actionName)
        if(action) action.params.push(param)
    }

    public getActions(): Required<ControllerAction>[] {
        return this.actions.filter(it => it.httpMethod && it.route) as Required<ControllerAction>[]
    }
}