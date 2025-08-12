import { BaseError } from './base.error';

export class InsufficientBalanceError extends BaseError {
    readonly statusCode = 400;
    readonly code = 'INSUFFICIENT_BALANCE';
    readonly isOperational = true;
    
    constructor(current: number, required: number) {
        super(`잔액이 부족합니다. 현재: ${current}원, 필요: ${required}원`);
    }
}

export class BudgetExceededError extends BaseError {
    readonly statusCode = 400;
    readonly code = 'BUDGET_EXCEEDED';
    readonly isOperational = true;
    
    constructor(category: string, exceeded: number) {
        super(`${category} 예산을 ${exceeded}원 초과했습니다`);
    }
}