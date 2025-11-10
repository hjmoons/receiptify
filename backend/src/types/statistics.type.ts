/**
 * 파일명: statistics.type.ts
 * 설명: 통계 관련 타입 정의
 * 작성일: 2025-01-10
 */

/**
 * 월별 지출/수입 통계
 */
export interface MonthlyStats {
    year: number;
    month: number;
    totalExpenditure: number;  // 총 지출
    totalIncome: number;       // 총 수입
    balance: number;           // 수입 - 지출
    transactionCount: number;  // 거래 건수
}

/**
 * 카테고리별 지출/수입 통계
 */
export interface CategoryStats {
    categoryId: number;
    categoryName: string;
    categoryLevel: number;
    parentId: number | null;
    totalAmount: number;       // 총 금액 (지출 또는 수입)
    transactionCount: number;  // 거래 건수
    percentage: number;        // 전체 대비 비율 (%)
}

/**
 * 월별 통계 조회 쿼리 파라미터
 */
export interface MonthlyStatsQuery {
    year: number;
    month: number;
    userId: number;
}

/**
 * 카테고리별 통계 조회 쿼리 파라미터
 */
export interface CategoryStatsQuery {
    year: number;
    month: number;
    userId: number;
    type?: 0 | 1;  // 0: 지출, 1: 수입 (기본값: 0)
}

/**
 * Top N 카테고리 통계 조회 쿼리 파라미터
 */
export interface TopCategoryStatsQuery {
    year: number;
    month: number;
    userId: number;
    type: 0 | 1;  // 0: 지출, 1: 수입
    limit?: number;  // 조회할 개수 (기본값: 5)
}
