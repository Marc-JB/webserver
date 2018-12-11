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
type json = {[key: string]: any}

class PersonController implements Controller<Person> {
    resourceName: string = "person"

    get(id: string, params: json): Person | Promise<Person> {
        return persons[id]
    }
    
    getAll(params: json): Person[] | Promise<Person[]> {
        return persons
    }

    create(model: json, params: json): Person | Promise<Person> {
        const person = new Person(model.name)
        persons.push(person)
        return person
    }

    update(id: string, model: json, params: json): void | Promise<void> {
        const person = new Person(model.name)
        persons[id] = person
    }

    updateAll(model: json, params: json): void | Promise<void> {
        throw new HttpErrors.Client.MethodNotAllowed()
    }

    delete(id: string, params: json): void | Promise<void> {
        throw new HttpErrors.Server.NotImplemented()
    }

    deleteAll(params: json): void | Promise<void> {
        throw new HttpErrors.Client.MethodNotAllowed()
    }
}

server.addController(new PersonController())
server.start()
```