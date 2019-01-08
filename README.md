# @peregrine/webserver
Express wrapper allowing you to create RESTful level 2 APIs easily.  
Syntax based on ASP.NET Core 2.1.

## Example
**CustomerController.ts**
```TypeScript
import { Controller, Resource, GetAll, GetItem, CreateItem, ID, Body, Auth } from "@peregrine/webserver"
import * as exceptions from "@peregrine/exceptions"

type json = {[key: string]: any} | any[]

@Resource("customers")
export class CustomerController {
    constructor(protected customerRepo: Repository<Customer>){}

    @GetAll()
    public getAll(): Customer[] {
        return this.customerRepo.getAll()
    }

    @GetItem()
    public getById(@ID() id: string): Customer {
        return this.customerRepo.getById(id)
    }

    @CreateItem()
    public createNewCustomer(@Body() body: string | json, @Auth() authorisedUser: User | null): Customer {
        if(typeof body == "string" || !Customer.isValid(body)) {
            throw new exceptions.http.BadRequest400Error()
        } else if(authorisedUser == null) {
            throw new exceptions.http.Unauthorised401Error()
        } else {
            return this.customerRepo.create(body as Customer)
        }
    }
}
```