# @peregrine/webserver [![license](https://badgen.net/github/license/Marc-JB/webserver?scale=1.1&color=cyan)](./LICENSE) [![npm](https://badgen.net/badge/icon/npm?icon=npm&color=cyan&scale=1.1&label)](https://www.npmjs.com/package/@peregrine/webserver)
Experimental http server for node.

## Example
Check out [the example that is part of this project](./example/main/Application.ts).

## To do
- Endpoint classes with @HttpGet, @HttpPost decorators
  ```
  class UsersEndpoint {
      @HttpGet
      getUsers( ... ){ ... }
  }
  ```
- @Route(string) decorator support to endpoint classes & class methods
  ```
  @Route("/users")
  class UsersEndpoint {
      @HttpGet
      @Route("/{id}")
      getUserById( ... ){ ... }
  }
  ```
- @Request, @Body, @Query(string) decorators in endpoint class methods
  ```
  @Route("/users")
  class UsersEndpoint {
      @HttpGet
      @Route("/{id}")
      getUserById(@Param("id") userId: string){ ... }
  }
  ```
- @RequestMiddleware, @ResponseMiddleware decorators in endpoint class methods
  ```
  @Route("/users")
  class UsersEndpoint {
      @ResponseMiddleware
      onResponse( ... ) { ... }
  }
  ```
- Add custom body parsing (request + response)
  ```
  rootEndpoint.addBodyParser("application/json", jsonParser)
  ```
- Better type checking for specific request types (HEAD without response body)
  ```
  endpoint.head(route: string, handler: (request: HttpRequest) => ResponseWithoutBody)
  ```
- Make sure /index.html is called when the path is /
- Automatically add methods (like HEAD when GET is registered), allow custom override.
- Automatically add headers to response (like Date), allow custom override.
- Add common HTTP Headers to HttpRequest/ResponseBuilder
  ```
  httpRequest.getLanguagesArray()
  responseBuilder.addDate(...)
  responseBuilder.setCachePolicy(...)
  ```
- Add new authentication handling and @AuthenticationHandler & @Auth decorators for endpoint classes
  ```
  class ProfileEndpoint {
      @HttpPut
      @Route("/{profileId}")
      updateProfile(@Auth authenticatedUser: User){ ... }

      @AuthenticationHandler
      onVerifyAuthentication(request: HttpRequest) {
          const user = getUserFromTokenOrNull(request.headers.get("X-Token"))
          if(user === null) {
              throw new AuthenticationInvalidError()
          }
      }
  }
  ```
- Add custom error throwing and handling
  ```
  rootEndpoint.post("/", () => throw new MethodNotAllowedError())
  rootEndpoint.onError((error: Error): HttpResponse => { ... })
  ```
- Add `ResponseBuilder.redirectResponse(newLocation: string)` and `ResponseBuilder.noContentResponse()`
- Add a folder to serve statically
- Improve tests
  * Add more unit tests
  * Add integration tests
- Resolve all @todo statements in code
  * [./lib/main/Async.ts#L22](./lib/main/Async.ts#L22)
  * [./src/main/request/HttpRequest.ts#L17](./src/main/request/HttpRequest.ts#L17)
