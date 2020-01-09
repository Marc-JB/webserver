# @peregrine/webserver [![license](https://badgen.net/github/license/Marc-JB/webserver?scale=1.1&color=cyan)](./LICENSE) [![npm](https://badgen.net/badge/icon/npm?icon=npm&color=cyan&scale=1.1&label)](https://www.npmjs.com/package/@peregrine/webserver)
Experimental http server for node.

## Example
Check out [the example that is part of this project](./src/example/index.ts).

## To do
- Decorator support (temporary removed after rewrite)
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
- Add more unit tests
- Add integration tests
- Add new authentication handling
