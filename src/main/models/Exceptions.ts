import { Exception } from "@peregrine/exceptions";

/**
 * Exception that gets thrown when a client registers to a port that is in use.
 */
export class PortInUseException extends Exception {
    public readonly name: string = "Port in use"

    constructor(port: number, message: string = `Port ${port} is already in use`, errorCode?: number){
        super(message, errorCode)
    }
}