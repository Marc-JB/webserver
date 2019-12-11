import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import * as mocha from "mocha"
import { Async } from "../main/index"

chai.use(chaiAsPromised)

type ConstructorType<R = {}> = { new (...args: any[]): R }

type Class = { [key: string]: (...args: any[]) => void | Promise<void> }

type ClassConstructor = ConstructorType<Class>

function initSuite<TFunction extends ClassConstructor>(constructor: TFunction): TFunction & { suite: mocha.Suite, instance: Class } {
    const c = (constructor as TFunction & { suite?: mocha.Suite, instance?: Class })
    c.suite = c.suite ?? mocha.describe(c.name.replace(/^[a-z]|[A-Z_]/g, (v, i) => i === 0 ? v.toUpperCase() : v === "_" ? " " : " " + v.toLowerCase()), () => {})
    c.instance = new c(c.suite)
    return c as TFunction & { suite: mocha.Suite, instance: Class }
}

export const suite: ClassDecorator = <T extends Function>(constructor: T): T => initSuite(constructor as T & ClassConstructor)

export const test: MethodDecorator = (target: Object, propertyKey: string | symbol): void => {
    const key = typeof propertyKey === "string" ? propertyKey : propertyKey.toString()
    const c = initSuite(target.constructor as ClassConstructor)
    const name = key.replace(/^[a-z]|[A-Z_]/g, (v, i) => i === 0 ? v.toUpperCase() : v === "_" ? " " : " " + v.toLowerCase())
    c.suite.addTest(new mocha.Test(name, (done: mocha.Done) => { Async.wrapInPromise(c.instance[key])().then(done, done) }))
}

export const Suite = suite

export const Test = test

export const expect = chai.expect
