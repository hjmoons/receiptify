import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/base.error';

export const errorHandler = (
    err: Error, 
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    // 이미 응답이 전송된 경우
    if (res.headersSent) {
        return next(err);
    }

    // 운영 에러인지 확인
    if (err instanceof BaseError && err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            code: err.code,
            message: err.message
        });
    }
    
    // 예상치 못한 에러는 로깅하고 일반적인 메시지 반환
    console.error('Unexpected error:', err);
    return res.status(500).json({
        success: false,
        code: 'INTERNAL_ERROR',
        message: '서버 에러가 발생했습니다'
    });
};