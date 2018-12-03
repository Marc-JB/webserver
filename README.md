# @peregrine/webserver
**Note: this is very experimental**

Quickly made example:

```TypeScript
import { Server, Endpoint, Controller, Status } from "@peregrine/webserver"
import { HttpErrors } from "@peregrine/exceptions"

const server = new Server()

// Customised endpoint
const endpoint = new Endpoint()
endpoint.get("/users/@me", (request) => {
    if(request.secure)
        return new Status.OK({ user: "someone" })

    throw new HttpErrors.Client.BadRequest("Must be done over https")
})
server.addApiEndpoint(endpoint)

// Quick RESTful endpoint creation (exmaple is level 2, level 3 should be possible)

// Model
class Person {
    constructor(public name: string){}
}

// Datasource
const persons = [new Person("Person X"), new Person("Someone")]

// Controller
class PersonController implements Controller<Person> {
    resourceName: string = "person"

    get(id: number, params: object = {}): Person | Promise<Person> {
        return persons[id]
    }
    
    getAll(params: object = {}): Person[] | Promise<Person[]> {
        return persons
    }

    create(model: object, params: object = {}): Person | Promise<Person> {
        const m = model as {name: string}
        const person = new Person(m.name)
        persons.push(person)
        return person
    }

    update(id: number, model: object, params: object = {}): void | Promise<void> {
        const m = model as {name: string}
        const person = new Person(m.name)
        persons[id] = person
    }

    updateAll(model: object, params: object = {}): void | Promise<void> {
        throw new HttpErrors.Client.MethodNotAllowed()
    }

    delete(id: number, params: object = {}): void | Promise<void> {
        throw new HttpErrors.Server.NotImplemented()
    }

    deleteAll(params: object = {}): void | Promise<void> {
        throw new HttpErrors.Client.MethodNotAllowed()
    }
}

server.addController(new PersonController())
```