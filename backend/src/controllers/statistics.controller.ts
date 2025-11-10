/**
 * 파일명: statistics.controller.ts
 * 설명: 통계 API 컨트롤러 - HTTP 요청/응답 처리
 * 작성일: 2025-01-10
 */

import { Request, Response, NextFunction } from "express";
import { StatisticsService } from "../services/statistics.service";
import { createError } from "../errors/app.error";

export class StatisticsController {
    /**
     * 월별 지출/수입 통계 조회
     *
     * GET /api/statistics/monthly?year={year}&month={month}
     *
     * @example
     * GET /api/statistics/monthly?year=2024&month=1
     */
    static async getMonthlyStats(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. 파라미터 추출 및 변환
            const userId = Number(req.user?.userId);
            const year = Number(req.query.year);
            const month = Number(req.query.month);

            // 2. 입력 검증
            if (!year || isNaN(year)) {
                throw createError.validation('연도 (year)');
            }

            if (!month || isNaN(month)) {
                throw createError.validation('월 (month)');
            }

            // 3. 서비스 호출
            const stats = await StatisticsService.getMonthlyStats(userId, year, month);

            // 4. 응답 반환
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            // 5. 에러 처리 위임
            next(error);
        }
    }

    /**
     * 카테고리별 지출/수입 통계 조회
     *
     * GET /api/statistics/category?year={year}&month={month}&type={type}
     *
     * @example
     * GET /api/statistics/category?year=2024&month=1&type=0
     */
    static async getCategoryStats(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. 파라미터 추출 및 변환
            const userId = Number(req.user?.userId);
            const year = Number(req.query.year);
            const month = Number(req.query.month);
            const type = req.query.type ? Number(req.query.type) : 0;

            // 2. 입력 검증
            if (!year || isNaN(year)) {
                throw createError.validation('연도 (year)');
            }

            if (!month || isNaN(month)) {
                throw createError.validation('월 (month)');
            }

            if (type !== 0 && type !== 1) {
                throw createError.validation('거래 유형 (type: 0=지출, 1=수입)');
            }

            // 3. 서비스 호출
            const stats = await StatisticsService.getCategoryStats(userId, year, month, type as 0 | 1);

            // 4. 응답 반환
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            // 5. 에러 처리 위임
            next(error);
        }
    }

    /**
     * 최근 N개월 월별 통계 조회
     *
     * GET /api/statistics/recent?months={months}
     *
     * @example
     * GET /api/statistics/recent?months=6
     */
    static async getRecentMonthlyStats(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. 파라미터 추출 및 변환
            const userId = Number(req.user?.userId);
            const months = req.query.months ? Number(req.query.months) : 6;

            // 2. 입력 검증
            if (isNaN(months)) {
                throw createError.validation('개월 수 (months)');
            }

            // 3. 서비스 호출
            const stats = await StatisticsService.getRecentMonthlyStats(userId, months);

            // 4. 응답 반환
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            // 5. 에러 처리 위임
            next(error);
        }
    }

    /**
     * 특정 카테고리의 월별 지출/수입 추이 조회
     *
     * GET /api/statistics/category/:id/trend?type={type}&months={months}
     *
     * @example
     * GET /api/statistics/category/5/trend?type=0&months=6
     */
    static async getCategoryTrend(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. 파라미터 추출 및 변환
            const userId = Number(req.user?.userId);
            const categoryId = Number(req.params.id);
            const type = Number(req.query.type);
            const months = req.query.months ? Number(req.query.months) : 6;

            // 2. 입력 검증
            if (!categoryId || isNaN(categoryId)) {
                throw createError.validation('카테고리 ID');
            }

            if (type !== 0 && type !== 1) {
                throw createError.validation('거래 유형 (type: 0=지출, 1=수입)');
            }

            if (isNaN(months)) {
                throw createError.validation('개월 수 (months)');
            }

            // 3. 서비스 호출
            const trend = await StatisticsService.getCategoryTrend(userId, categoryId, type as 0 | 1, months);

            // 4. 응답 반환
            res.status(200).json({
                success: true,
                data: trend
            });
        } catch (error) {
            // 5. 에러 처리 위임
            next(error);
        }
    }

    /**
     * Top N 카테고리 통계 조회
     *
     * GET /api/statistics/top?year={year}&month={month}&type={type}&limit={limit}
     *
     * @example
     * GET /api/statistics/top?year=2024&month=1&type=0&limit=5
     */
    static async getTopCategories(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. 파라미터 추출 및 변환
            const userId = Number(req.user?.userId);
            const year = Number(req.query.year);
            const month = Number(req.query.month);
            const type = Number(req.query.type);
            const limit = req.query.limit ? Number(req.query.limit) : 5;

            // 2. 입력 검증
            if (!year || isNaN(year)) {
                throw createError.validation('연도 (year)');
            }

            if (!month || isNaN(month)) {
                throw createError.validation('월 (month)');
            }

            if (type !== 0 && type !== 1) {
                throw createError.validation('거래 유형 (type: 0=지출, 1=수입)');
            }

            if (isNaN(limit)) {
                throw createError.validation('조회 개수 (limit)');
            }

            // 3. 서비스 호출
            const stats = await StatisticsService.getTopCategories(userId, year, month, type as 0 | 1, limit);

            // 4. 응답 반환
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            // 5. 에러 처리 위임
            next(error);
        }
    }
}
