import { Request } from "express"

export default interface AuthHandler<T> {
    /**
     * Implements this function, so that it retreives the authentication from the request.
     * Implementation recommendation:
     * 1. Get the credentials from the request headers
     * 2a. Return undefined if the credentials don't exist
     * 2b. Check if the credentials are valid (otherwise throw an authentication error)
     * 3b. Return the user object that belongs to the credentials
     * @param request The express request
     */
    getAuth(request: Request): Promise<T | undefined> | T | undefined
}