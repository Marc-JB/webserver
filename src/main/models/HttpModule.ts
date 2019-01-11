import http from "http"
import https from "https"

declare function require(name:string): any
let http2: any
try {
    http2 = require("http2")
} catch (error) {
    console.log(error)
}

/**
 * A class containing serveral constructors for HTTP servers
 */
export class HttpModule {
    /**
     * An HTTP/1.x server constructor
     * @returns a function that creates an HTTP/1.x server
     */
    public static get Http1(){
        return http.createServer
    }

    /**
     * An HTTP/1.x server constructor with TLS security
     * @returns a function that creates an HTTP/1.x server
     */
    public static get Https1(){
        return https.createServer
    }

    /**
     * An HTTP/2.0 server constructor
     * @returns a function that creates an HTTP/2.0 server (if node doesn't support http2, fallback to https)
     */
    public static get Http2(){
        return http2 ? http2.createSecureServer : https.createServer
    }
}