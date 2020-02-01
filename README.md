# @peregrine/webserver [![Node CI](https://github.com/Marc-JB/webserver/workflows/Node%20CI/badge.svg)](https://github.com/Marc-JB/webserver/actions?query=workflow%3A%22Node+CI%22) [![license](https://badgen.net/github/license/Marc-JB/webserver?color=cyan)](https://github.com/Marc-JB/webserver/blob/master/LICENSE) [![npm](https://badgen.net/badge/icon/npm?icon=npm&color=cyan&label)](https://www.npmjs.com/package/@peregrine/webserver) ![node version](https://badgen.net/npm/node/@peregrine/webserver/dev) ![types](https://badgen.net/npm/types/@peregrine/webserver/dev?icon=typescript)
Experimental http server for node.

## Install
- **v0.3**: `npm install @peregrine/webserver`
- **v0.5**: `npm install @peregrine/webserver@dev` *(rewrite without decorators, will be re-added in future)*

## Notes
- On node < 10.0, use the `--harmony` flag when running your project

## Example
Check out [the example that is part of this project](https://github.com/Marc-JB/webserver/blob/master/example/main/Application.ts).

## To do
**Before version 1.0:**
- Endpoint classes with @HttpGet, @HttpPost decorators
  ```typescript
  class UsersEndpoint {
      @HttpGet
      getUsers(/* ... */){ /* ... */ }
  }
  ```
- @Route(string) decorator support to endpoint classes & class methods
  ```typescript
  @Route("/users")
  class UsersEndpoint {
      @HttpGet
      @Route("/{id}")
      getUserById(/* ... */){ /* ... */ }
  }
  ```
- @Request, @Body, @Query(string) decorators in endpoint class methods
  ```typescript
  @Route("/users")
  class UsersEndpoint {
      @HttpGet
      @Route("/{id}")
      getUserById(@Param("id") userId: string){ /* ... */ }
  }
  ```
- Add custom body parsing (request + response)
  ```typescript
  rootEndpoint.addBodyParser("application/json", jsonParser)
  ```
- Better type checking for specific request types (HEAD without response body)
  ```typescript
  endpoint.head(route: string, handler: (request: HttpRequest) => ResponseWithoutBody)
  ```
- Add new authentication handling and @AuthenticationHandler (**v1.0+**) & @Auth decorators for endpoint classes
  ```typescript
  class ProfileEndpoint {
      @HttpPut
      @Route("/{profileId}")
      updateProfile(@Auth authenticatedUser: User){ /* ... */ }

      @AuthenticationHandler
      onVerifyAuthentication(request: HttpRequest) {
          const user = getUserFromTokenOrNull(request.headers.get("X-Token"))
          if(user === null) {
              throw new AuthenticationInvalidError()
          }
      }
  }
  ```
- Add custom error throwing and handling and add @ErrorHandler (**v1.0+**) decorator for endpoint classes
  ```typescript
  rootEndpoint.post("/", () => throw new MethodNotAllowedError())
  rootEndpoint.onError((error: Error): HttpResponse => { /* ... */ })
  ```
- Improve tests
  * Add more unit tests
  * Add integration tests

**After version 1.0:**
- Resolve @todo statement at [./lib/main/Async.ts#L22](./lib/main/Async.ts#L22)
- Add more response types to the ResponseBuilder class
- Add a folder to serve statically
- Make sure /index.html is called when the path is /
- Automatically add methods (like HEAD when GET is registered), allow custom override.
- Automatically add headers to response (like Date), allow custom override.
- Add common HTTP Headers to HttpRequest/ResponseBuilder
  ```typescript
  httpRequest.getLanguagesArray()
  responseBuilder.addDate(/* ... */)
  responseBuilder.setCachePolicy(/* ... */)
  ```
- @RequestMiddleware, @ResponseMiddleware decorators in endpoint class methods
  ```typescript
  @Route("/users")
  class UsersEndpoint {
      @ResponseMiddleware
      onResponse(/* ... */) { /* ... */ }
  }
  ```
