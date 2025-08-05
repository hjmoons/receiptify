import { BaseError } from './base.error';

export class DuplicateError extends BaseError {
    readonly statusCode = 409;
    readonly code = 'DUPLICATE_CATEGORY_NAME';
    readonly isOperational = true;
}

export class CreateError extends BaseError {
    readonly statusCode = 500;
    readonly code = 'CATEGORY_CREATE_FAILED';
    readonly isOperational = true;
}

export class UpdateError extends BaseError {
    readonly statusCode = 500;
    readonly code = 'CATEGORY_UPDATE_FAILED';
    readonly isOperational = true;
}

export class DeleteError extends BaseError {
    readonly statusCode = 500;
    readonly code = 'CATEGORY_DELETE_FAILED';
    readonly isOperational = true;
}