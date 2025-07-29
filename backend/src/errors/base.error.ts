export abstract class BaseError extends Error {
    abstract readonly statusCode: number;
    abstract readonly code: string;
    abstract readonly isOperational: boolean;

    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}