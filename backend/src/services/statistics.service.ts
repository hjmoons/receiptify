/**
 * 파일명: statistics.service.ts
 * 설명: 통계 비즈니스 로직 처리
 * 작성일: 2025-01-10
 */

import { StatisticsModel } from "../models/statistics.model";
import { MonthlyStats, CategoryStats } from "../types/statistics.type";
import { createError } from "../errors/app.error";

export class StatisticsService {
    /**
     * 월별 지출/수입 통계 조회
     *
     * @param userId - 사용자 ID
     * @param year - 연도
     * @param month - 월 (1-12)
     * @returns 월별 통계 데이터
     * @throws {ValidationError} 잘못된 년/월 형식
     *
     * @example
     * const stats = await StatisticsService.getMonthlyStats(1, 2024, 1);
     */
    static async getMonthlyStats(userId: number, year: number, month: number): Promise<MonthlyStats> {
        // 입력 검증
        if (!year || year < 2000 || year > 2100) {
            throw createError.validation('연도');
        }

        if (!month || month < 1 || month > 12) {
            throw createError.validation('월');
        }

        const stats = await StatisticsModel.getMonthlyStats({ userId, year, month });

        // 데이터가 없는 경우 기본값 반환
        if (!stats) {
            return {
                year,
                month,
                totalExpenditure: 0,
                totalIncome: 0,
                balance: 0,
                transactionCount: 0
            };
        }

        return stats;
    }

    /**
     * 카테고리별 지출/수입 통계 조회
     *
     * @param userId - 사용자 ID
     * @param year - 연도
     * @param month - 월 (1-12)
     * @param type - 거래 유형 (0: 지출, 1: 수입)
     * @returns 카테고리별 통계 배열
     * @throws {ValidationError} 잘못된 입력값
     *
     * @example
     * const categoryStats = await StatisticsService.getCategoryStats(1, 2024, 1, 0);
     */
    static async getCategoryStats(
        userId: number,
        year: number,
        month: number,
        type: 0 | 1 = 0
    ): Promise<CategoryStats[]> {
        // 입력 검증
        if (!year || year < 2000 || year > 2100) {
            throw createError.validation('연도');
        }

        if (!month || month < 1 || month > 12) {
            throw createError.validation('월');
        }

        if (type !== 0 && type !== 1) {
            throw createError.validation('거래 유형 (0: 지출, 1: 수입)');
        }

        const stats = await StatisticsModel.getCategoryStats({
            userId,
            year,
            month,
            type
        });

        return stats;
    }

    /**
     * 최근 N개월 월별 통계 조회
     *
     * @param userId - 사용자 ID
     * @param months - 조회할 개월 수 (기본값: 6개월, 최대: 12개월)
     * @returns 월별 통계 배열 (최근 순)
     * @throws {ValidationError} 잘못된 개월 수
     *
     * @example
     * const recentStats = await StatisticsService.getRecentMonthlyStats(1, 6);
     */
    static async getRecentMonthlyStats(userId: number, months: number = 6): Promise<MonthlyStats[]> {
        // 입력 검증
        if (months < 1 || months > 12) {
            throw createError.validation('개월 수 (1-12 범위)');
        }

        const stats = await StatisticsModel.getRecentMonthlyStats(userId, months);

        return stats;
    }

    /**
     * 특정 카테고리의 월별 지출/수입 추이 조회
     *
     * @param userId - 사용자 ID
     * @param categoryId - 카테고리 ID
     * @param type - 거래 유형 (0: 지출, 1: 수입)
     * @param months - 조회할 개월 수 (기본값: 6개월)
     * @returns 월별 금액 배열
     * @throws {ValidationError} 잘못된 입력값
     *
     * @example
     * const trend = await StatisticsService.getCategoryTrend(1, 5, 0, 6);
     */
    static async getCategoryTrend(
        userId: number,
        categoryId: number,
        type: 0 | 1,
        months: number = 6
    ): Promise<Array<{year: number, month: number, totalAmount: number}>> {
        // 입력 검증
        if (!categoryId || categoryId <= 0) {
            throw createError.validation('카테고리 ID');
        }

        if (type !== 0 && type !== 1) {
            throw createError.validation('거래 유형 (0: 지출, 1: 수입)');
        }

        if (months < 1 || months > 12) {
            throw createError.validation('개월 수 (1-12 범위)');
        }

        const trend = await StatisticsModel.getCategoryMonthlyTrend(userId, categoryId, type, months);

        return trend;
    }

    /**
     * 이번 달 Top N 카테고리 조회
     *
     * @param userId - 사용자 ID
     * @param year - 연도
     * @param month - 월 (1-12)
     * @param type - 거래 유형 (0: 지출, 1: 수입)
     * @param limit - 조회할 개수 (기본값: 5)
     * @returns Top N 카테고리 통계 배열
     * @throws {ValidationError} 잘못된 입력값
     *
     * @example
     * const top5 = await StatisticsService.getTopCategories(1, 2024, 1, 0, 5);
     */
    static async getTopCategories(
        userId: number,
        year: number,
        month: number,
        type: 0 | 1,
        limit: number = 5
    ): Promise<CategoryStats[]> {
        // 입력 검증
        if (!year || year < 2000 || year > 2100) {
            throw createError.validation('연도');
        }

        if (!month || month < 1 || month > 12) {
            throw createError.validation('월');
        }

        if (type !== 0 && type !== 1) {
            throw createError.validation('거래 유형 (0: 지출, 1: 수입)');
        }

        if (limit < 1 || limit > 20) {
            throw createError.validation('조회 개수 (1-20 범위)');
        }

        const stats = await StatisticsModel.getTopCategories({
            userId,
            year,
            month,
            type,
            limit
        });

        return stats;
    }
}
