import { BaseError } from './base.error';

export class AppError extends BaseError {
    readonly isOperational = true;

    constructor(
        message: string,
        readonly statusCode: number,
        readonly code: string
    ) {
        super(message);
    }
}

// 자주 쓰는 에러들을 팩토리 함수로 만들기
export const createError = {
    notFound: (resource: string) => 
        new AppError(`${resource}를 찾을 수 없습니다`, 404, 'NOT_FOUND'),
    
    duplicate: (resource: string) => 
        new AppError(`이미 존재하는 ${resource}입니다`, 409, 'DUPLICATE'),
    
    permission: (resource?: string) => 
        new AppError(resource ? `${resource}에 대한 권한이 없습니다` : '권한이 없습니다', 403, 'PERMISSION_DENIED'),
    
    validation: (field: string) => 
        new AppError(`${field} 값이 올바르지 않습니다`, 400, 'VALIDATION_ERROR'),
    
    internal: (message = '서버 에러가 발생했습니다') => 
        new AppError(message, 500, 'INTERNAL_ERROR'),
    
    unauthorized: () => 
        new AppError('인증이 필요합니다', 401, 'UNAUTHORIZED'),
    
    createFailed: (resource: string) => 
        new AppError(`${resource} 생성에 실패했습니다`, 500, 'CREATE_FAILED'),
    
    updateFailed: (resource: string) => 
        new AppError(`${resource} 업데이트에 실패했습니다`, 500, 'UPDATE_FAILED'),
    
    deleteFailed: (resource: string) => 
        new AppError(`${resource} 삭제에 실패했습니다`, 500, 'DELETE_FAILED'),
};