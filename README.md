# @peregrine/webserver
Express wrapper allowing you to create RESTful level 2 APIs easily.  
Syntax based on ASP.NET Core 2.1.

## Example
This example shows a Web API with authentication and a full resource endpoint (customers). 

**CustomerController.ts**
```TypeScript
import { Controller } from "@peregrine/webserver"
import { HttpErrors } from "@peregrine/exceptions"

type json = {[key: string]: any}

// /api/v1/customers/
export default class CustomerController implements Controller<Customer, User> {
    // This will be used to generate the URL
    public resourceName: string = "customers"

    constructor(protected customerRepo: Repository<Customer>){}
    
    // GET /api/v1/customers/{id}
    public async get(id: string, params: json, authenticatedUser?: User): Promise<Customer> {
        // Search the repository for a model with id "id"
        const model = await this.customerRepo.getById(id)

        // Check if the model exists
        if(!model) {
            // Return 404 NotFound
            throw new HttpErrors.Client.NotFound()
        } else {
            // Return the model
            return model
        }
    }
    
    // GET /api/v1/customers
    public async getAll(params: json, authenticatedUser?: User): Promise<Customer[]> {
        // Check if the url contains ?email=test@example.com
        if(params.email) { 
            // Return a list of customers where the email equals the email from params
            return await this.customerRepo.getAllWhere(customer => customer.email == params.email)
        } else {
            // Return all customers
            return await this.customerRepo.getAll()
        }
    }

    // POST /api/v1/customers
    public async create(model: json, params: json, authenticatedUser?: User): Promise<Customer> {
        // Check if the request contains valid credentials
        if(!authenticatedUser){ 
            // Return 401 Unauthorised
            throw new HttpErrors.Client.Unauthorised() 
        }

        // The model passed is json, so check if the model is valid
        const customer = this.validateModel(model)

        // Save the ID of the authenticated user into the customer 
        customer.contactPerson = authenticatedUser.id

        // Create the customer and return the customer
        return await this.customerRepo.create(customer) 
    }

    // PUT /api/v1/customers/{id}
    public async update(id: string, model: json, params: json, authenticatedUser?: User): Promise<void> {
        // Check if the request contains valid credentials
        if(!authenticatedUser){ 
            // Return 401 Unauthorised
            throw new HttpErrors.Client.Unauthorised() 
        }

        // Check if the user has edit rights on this model
        if(!(await this.hasEditRights(id, authenticatedUser))){ 
            // Return 403 Forbidden
            throw new HttpErrors.Client.Forbidden() 
        }

        // The model passed is json, so check if the model is valid.
        const customer = this.validateModel(model)
        
        // Update the customer
        await this.customerRepo.update(id, customer)
    }

    // PUT /api/v1/customers
    public updateAll(model: json, params: json, authenticatedUser?: User): void | Promise<void> {
        // Don't allow these kind of requests. Alternatively, you can remove this function and it will return a 404 NotFound
        throw new HttpErrors.Client.MethodNotAllowed()
    }

    // DELETE /api/v1/customers/{id}
    public async delete(id: string, params: json, authenticatedUser?: User): Promise<void> {
        // Check if the request contains valid credentials
        if(!authenticatedUser){ 
            // Return 401 Unauthorised
            throw new HttpErrors.Client.Unauthorised() 
        }

        // Check if the user has edit rights on this model
        if(!(await this.hasEditRights(id, authenticatedUser))){ 
            // Return 403 Forbidden
            throw new HttpErrors.Client.Forbidden() 
        }

        // Delete the customer
        await this.customerRepo.delete(id) 
    }

    // DELETE /api/v1/customers
    public deleteAll(params: json, authenticatedUser?: User): void | Promise<void> {
        // Don't allow these kind of requests. Alternatively, you can remove this function and it will return a 404 NotFound
        throw new HttpErrors.Client.MethodNotAllowed()
    }

    protected async hasEditRights(id: string, authenticatedUser: User): Promise<boolean> {
        // Get the customer by its ID
        const customer = await this.customerRepo.getById(id)
        // Check if the customer has authUser as contactPerson
        return customer != null && customer.contactPerson == authenticatedUser.id
    }

    protected validateModel(model: json): Customer {
        // Check if the json is valid
        if(model.contactPerson || !model.name || typeof model.name !== "string"){
            // Return 400 BadRequest
            throw new HttpErrors.Client.BadRequest()
        }

        // Cast the valid model to Customer
        return model as Customer
    }
}
```

**BearerTokenAuthHandler.ts**
```TypeScript
import { AuthHandler } from "@peregrine/webserver"
import { Request } from "express";

/**
 * This is an example that uses a Bearer Token.
 * Don't user Bearer Tokens in production, as it won't be secure enough.
 */
export default class BearerTokenAuthHandler implements AuthHandler<User> {
    constructor(protected userRepo: Repository<User>){}

    public async getAuth(request: Request): Promise<User | undefined> {
        const token = this.getTokenFromRequest(request)
        return token ? await this.getUserFromToken(token) : undefined
    }

    protected getTokenFromRequest(request: Request): string | null {
        const header = request.header("Authorization")
        return header && header.includes("Bearer ") ? header.replace("Bearer ", "") : null
    }

    protected async getUserFromToken(token: string): Promise<User | undefined> {
        return await this.userRepo.getWhere(user => user.token == token) || undefined
    }
}
```

**index.ts**
```TypeScript
import { Server } from "@peregrine/webserver"
import CustomerController from "./controllers/CustomerController";

import MongoDB from "./datasource/mongo/MongoDB"
import UserRepository from "./datasource/mongo/UserRepository"
import CustomerRepository from "./datasource/mongo/CustomerRepository"

import BearerTokenAuthHandler from "./authentication/BearerTokenAuthHandler"

(async () => {
    // DB example
    const db = new MongoDB(process.env.DB_NAME)
    const dbConnection = await db.connect(process.env.DB_HOST, parseInt(process.env.DB_PORT), {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    })
    console.log(`Connected to MongoDB on ${dbConnection.connectionString}`)

    const userRepo = new UserRepository()
    const customerRepo = new CustomerRepository()
    
    // Create our express server
    const server = new Server()
    // Add default CORS headers
    server.setCorsHeaders()
    // Create our authentication handler
    const authHandler = new BearerTokenAuthHandler(userRepo)
    // Create the CustomerController, and add it with our authentication handler to our server.
    server.addController(new CustomerController(customerRepo), authHandler)

    // Start the server
    const serverConnection = await server.start(parseInt(process.env.PORT))
    console.log(`Server is connected and live on port ${serverConnection.port}`)
})()
```