import { BaseError } from './base.error';

export class NotFoundError extends BaseError {
    readonly statusCode = 404;
    readonly code = 'NOT_FOUND';
    readonly isOperational = true;
}

export class PermissionError extends BaseError {
    readonly statusCode = 403;
    readonly code = 'PERMISSION_DENIED';
    readonly isOperational = true;
}

export class InternalError extends BaseError {
    readonly statusCode = 500;
    readonly code = 'INTERNAL_ERROR';
    readonly isOperational = true;
}