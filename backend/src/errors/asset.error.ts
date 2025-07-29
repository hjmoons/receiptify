import { BaseError } from './base.error';

export class DuplicateAssetError extends BaseError {
    readonly statusCode = 409;
    readonly code = 'DUPLICATE_ASSET';
    readonly isOperational = true;
}

export class AssetCreateError extends BaseError {
    readonly statusCode = 500;
    readonly code = 'ASSET_CREATE_FAILED';
    readonly isOperational = true;
}

export class AssetUpdateError extends BaseError {
    readonly statusCode = 500;
    readonly code = 'ASSET_UPDATE_FAILED';
    readonly isOperational = true;
}

export class AssetDeleteError extends BaseError {
    readonly statusCode = 500;
    readonly code = 'ASSET_DELETE_FAILED';
    readonly isOperational = true;
}