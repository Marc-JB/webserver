# @peregrine/webserver
Experimental http server for node.

## Example
Check out [the example that is part of this project](./src/example/index.ts).

## To do
- Decorator support
  * @HttpGet, @HttpPost, etc.
  * @Route(string)
  * @Request, @Body, etc.
  * @RequestMiddleware, @ResponseMiddleware
  * @AuthenticationHandler
- Add custom body parsing (request + response)
- Better type checking for specific request types (HEAD without response body)
- Make sure /index.html is called when the path is /
- Automatically add methods (like HEAD when GET is registered), allow custom override.
- Automatically add headers to response (like Date), allow custom override.
- Add common HTTP Headers to HttpRequest/ResponseBuilder
- Move /src/example/ out of /src and into /example/main/ and add /example/test/ with tests
- Add more unit tests
- Add integration tests
- Add new authentication handling
