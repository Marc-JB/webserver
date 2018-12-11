import { Request } from "express"

export default interface AuthHandler<T> {
    /**
     * Implements this function, so that it retreives the authentication from the request.
     * Implementation recommendation:
     * 1. Get the credentials from the request headers
     * 2. Check if the credentials are valid (otherwise throw an authentication error)
     * 3. Return the user object that belongs to the credentials
     * @param request The express request
     */
    getAuth(request: Request): Promise<T> | T
}