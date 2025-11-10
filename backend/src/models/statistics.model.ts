/**
 * 파일명: statistics.model.ts
 * 설명: 통계 데이터베이스 모델
 * 작성일: 2025-01-10
 *
 * receipts 테이블에서 실시간으로 통계 데이터를 계산합니다.
 */

import db from "../config/database";
import { MonthlyStats, CategoryStats, MonthlyStatsQuery, CategoryStatsQuery, TopCategoryStatsQuery } from "../types/statistics.type";

export class StatisticsModel {
    /**
     * 월별 지출/수입 통계 조회
     *
     * @param query - 조회 조건 (year, month, userId)
     * @returns 월별 지출/수입 통계
     *
     * @example
     * const stats = await StatisticsModel.getMonthlyStats({ year: 2024, month: 1, userId: 1 });
     */
    static async getMonthlyStats(query: MonthlyStatsQuery): Promise<MonthlyStats | undefined> {
        const { year, month, userId } = query;

        const stmt = db.prepare(`
            SELECT
                @year AS year,
                @month AS month,
                COALESCE(SUM(CASE WHEN type = 0 THEN cost END), 0) AS totalExpenditure,
                COALESCE(SUM(CASE WHEN type = 1 THEN cost END), 0) AS totalIncome,
                COALESCE(SUM(CASE WHEN type = 1 THEN cost END), 0) - COALESCE(SUM(CASE WHEN type = 0 THEN cost END), 0) AS balance,
                COUNT(CASE WHEN type IN (0, 1) THEN 1 END) AS transactionCount
            FROM receipts
            WHERE user_id = @userId
                AND type IN (0, 1)
                AND strftime('%Y', transaction_date) = @yearStr
                AND strftime('%m', transaction_date) = @monthStr
        `);

        return stmt.get({
            year,
            month,
            userId,
            yearStr: year.toString(),
            monthStr: month.toString().padStart(2, '0')
        }) as MonthlyStats | undefined;
    }

    /**
     * 카테고리별 지출/수입 통계 조회 (하위 카테고리 포함)
     *
     * @param query - 조회 조건 (year, month, userId, type)
     * @returns 카테고리별 통계 배열
     *
     * @example
     * const stats = await StatisticsModel.getCategoryStats({ year: 2024, month: 1, userId: 1, type: 0 });
     */
    static async getCategoryStats(query: CategoryStatsQuery): Promise<CategoryStats[]> {
        const { year, month, userId, type = 0 } = query;

        // 1. 모든 카테고리 정보 가져오기
        const allCategoriesStmt = db.prepare(`
            SELECT
                id AS categoryId,
                name AS categoryName,
                level AS categoryLevel,
                parent_id AS parentId
            FROM categories
            WHERE user_id = @userId
                AND type = @type
            ORDER BY level, id
        `);

        const allCategories = allCategoriesStmt.all({
            userId,
            type
        }) as CategoryStats[];

        // 2. 각 카테고리별 직접 거래 집계
        const directTransactionsStmt = db.prepare(`
            SELECT
                category_id,
                COALESCE(SUM(cost), 0) AS totalAmount,
                COUNT(id) AS transactionCount
            FROM receipts
            WHERE user_id = @userId
                AND type = @type
                AND strftime('%Y', transaction_date) = @yearStr
                AND strftime('%m', transaction_date) = @monthStr
            GROUP BY category_id
        `);

        const directTransactions = directTransactionsStmt.all({
            userId,
            type,
            yearStr: year.toString(),
            monthStr: month.toString().padStart(2, '0')
        }) as Array<{ category_id: number; totalAmount: number; transactionCount: number }>;

        // 3. Map으로 변환
        const transactionMap = new Map<number, { totalAmount: number; transactionCount: number }>();
        directTransactions.forEach(t => {
            transactionMap.set(t.category_id, {
                totalAmount: t.totalAmount,
                transactionCount: t.transactionCount
            });
        });

        // 4. 카테고리별 총액 계산 (하위 카테고리 포함)
        const categoryMap = new Map<number, CategoryStats>();
        allCategories.forEach(cat => {
            const trans = transactionMap.get(cat.categoryId);
            categoryMap.set(cat.categoryId, {
                ...cat,
                totalAmount: trans?.totalAmount || 0,
                transactionCount: trans?.transactionCount || 0,
                percentage: 0
            });
        });

        // 5. 하위 카테고리의 금액을 상위 카테고리에 합산
        // 3단계 → 2단계 → 1단계 순서로 합산
        for (let level = 3; level >= 2; level--) {
            allCategories
                .filter(cat => cat.categoryLevel === level && cat.parentId)
                .forEach(childCat => {
                    const child = categoryMap.get(childCat.categoryId);
                    const parent = categoryMap.get(childCat.parentId!);
                    if (child && parent) {
                        parent.totalAmount += child.totalAmount;
                        parent.transactionCount += child.transactionCount;
                    }
                });
        }

        // 6. 금액이 0보다 큰 카테고리만 필터링
        const results = Array.from(categoryMap.values())
            .filter(cat => cat.totalAmount > 0)
            .sort((a, b) => b.totalAmount - a.totalAmount);

        // 5. 총액 계산 (1단계 카테고리의 합만 계산 - 중복 방지)
        const totalAmount = results
            .filter(cat => cat.categoryLevel === 1)
            .reduce((sum, item) => sum + item.totalAmount, 0);

        // 6. 비율 계산
        if (totalAmount > 0) {
            results.forEach(item => {
                item.percentage = Math.round((item.totalAmount / totalAmount) * 10000) / 100;
            });
        } else {
            results.forEach(item => {
                item.percentage = 0;
            });
        }

        return results;
    }

    /**
     * 최근 N개월 월별 통계 조회
     *
     * @param userId - 사용자 ID
     * @param months - 조회할 개월 수 (기본값: 6개월)
     * @returns 월별 통계 배열 (최근 순)
     *
     * @example
     * const stats = await StatisticsModel.getRecentMonthlyStats(1, 6);
     */
    static async getRecentMonthlyStats(userId: number, months: number = 6): Promise<MonthlyStats[]> {
        const stmt = db.prepare(`
            SELECT
                CAST(strftime('%Y', transaction_date) AS INTEGER) AS year,
                CAST(strftime('%m', transaction_date) AS INTEGER) AS month,
                COALESCE(SUM(CASE WHEN type = 0 THEN cost END), 0) AS totalExpenditure,
                COALESCE(SUM(CASE WHEN type = 1 THEN cost END), 0) AS totalIncome,
                COALESCE(SUM(CASE WHEN type = 1 THEN cost END), 0) - COALESCE(SUM(CASE WHEN type = 0 THEN cost END), 0) AS balance,
                COUNT(CASE WHEN type IN (0, 1) THEN 1 END) AS transactionCount
            FROM receipts
            WHERE user_id = ?
                AND type IN (0, 1)
                AND transaction_date >= date('now', '-' || ? || ' months')
            GROUP BY strftime('%Y-%m', transaction_date)
            ORDER BY transaction_date DESC
            LIMIT ?
        `);

        return stmt.all(userId, months, months) as MonthlyStats[];
    }

    /**
     * 특정 카테고리의 월별 지출/수입 추이 조회 (하위 카테고리 포함)
     *
     * @param userId - 사용자 ID
     * @param categoryId - 카테고리 ID
     * @param type - 거래 유형 (0: 지출, 1: 수입)
     * @param months - 조회할 개월 수 (기본값: 6개월)
     * @returns 월별 금액 배열
     *
     * @example
     * const trend = await StatisticsModel.getCategoryMonthlyTrend(1, 5, 0, 6);
     */
    static async getCategoryMonthlyTrend(userId: number, categoryId: number, type: 0 | 1, months: number = 6): Promise<Array<{year: number, month: number, totalAmount: number}>> {
        // 1. 하위 카테고리 ID 목록 가져오기 (재귀적으로)
        const getChildCategoryIds = (catId: number): number[] => {
            const childStmt = db.prepare(`
                SELECT id FROM categories WHERE parent_id = ? AND user_id = ?
            `);
            const children = childStmt.all(catId, userId) as Array<{ id: number }>;

            let allIds = [catId];
            children.forEach(child => {
                allIds = allIds.concat(getChildCategoryIds(child.id));
            });

            return allIds;
        };

        const categoryIds = getChildCategoryIds(categoryId);

        // 2. 카테고리 ID 목록으로 월별 금액 조회
        const placeholders = categoryIds.map(() => '?').join(',');
        const stmt = db.prepare(`
            SELECT
                CAST(strftime('%Y', transaction_date) AS INTEGER) AS year,
                CAST(strftime('%m', transaction_date) AS INTEGER) AS month,
                COALESCE(SUM(cost), 0) AS totalAmount
            FROM receipts
            WHERE user_id = ?
                AND category_id IN (${placeholders})
                AND type = ?
                AND transaction_date >= date('now', '-' || ? || ' months')
            GROUP BY strftime('%Y-%m', transaction_date)
            ORDER BY transaction_date DESC
            LIMIT ?
        `);

        return stmt.all(userId, ...categoryIds, type, months, months) as Array<{year: number, month: number, totalAmount: number}>;
    }

    /**
     * 이번 달 Top N 카테고리 조회 (2레벨 카테고리만, 하위 카테고리 포함)
     *
     * @param query - 조회 조건 (year, month, userId, type, limit)
     * @returns Top N 카테고리 통계 배열
     *
     * @example
     * const top5 = await StatisticsModel.getTopCategories({ year: 2024, month: 1, userId: 1, type: 0, limit: 5 });
     */
    static async getTopCategories(query: TopCategoryStatsQuery): Promise<CategoryStats[]> {
        const { year, month, userId, type, limit = 5 } = query;

        // 1. 2레벨 카테고리 정보 가져오기
        const level2CategoriesStmt = db.prepare(`
            SELECT
                id AS categoryId,
                name AS categoryName,
                level AS categoryLevel,
                parent_id AS parentId
            FROM categories
            WHERE user_id = @userId
                AND type = @type
                AND level = 2
            ORDER BY id
        `);

        const level2Categories = level2CategoriesStmt.all({
            userId,
            type
        }) as CategoryStats[];

        // 2. 각 2레벨 카테고리와 그 하위(3레벨) 카테고리의 거래 합계 계산
        const categoryMap = new Map<number, CategoryStats>();

        for (const cat of level2Categories) {
            // 해당 2레벨 카테고리와 그 하위 3레벨 카테고리 ID 가져오기
            const childCategoriesStmt = db.prepare(`
                SELECT id FROM categories WHERE parent_id = ? AND user_id = ?
            `);
            const children = childCategoriesStmt.all(cat.categoryId, userId) as Array<{ id: number }>;
            const categoryIds = [cat.categoryId, ...children.map(c => c.id)];

            // 해당 카테고리들의 거래 합계
            const placeholders = categoryIds.map(() => '?').join(',');
            const transactionStmt = db.prepare(`
                SELECT
                    COALESCE(SUM(cost), 0) AS totalAmount,
                    COUNT(id) AS transactionCount
                FROM receipts
                WHERE user_id = ?
                    AND type = ?
                    AND category_id IN (${placeholders})
                    AND strftime('%Y', transaction_date) = ?
                    AND strftime('%m', transaction_date) = ?
            `);

            const result = transactionStmt.get(
                userId,
                type,
                ...categoryIds,
                year.toString(),
                month.toString().padStart(2, '0')
            ) as { totalAmount: number; transactionCount: number };

            categoryMap.set(cat.categoryId, {
                ...cat,
                totalAmount: result.totalAmount,
                transactionCount: result.transactionCount,
                percentage: 0
            });
        }

        // 3. 금액이 0보다 큰 카테고리만 필터링하고 정렬
        const results = Array.from(categoryMap.values())
            .filter(cat => cat.totalAmount > 0)
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, limit);

        // 4. 총액 계산 (Top N의 합)
        const totalAmount = results.reduce((sum, item) => sum + item.totalAmount, 0);

        // 5. 비율 계산
        if (totalAmount > 0) {
            results.forEach(item => {
                item.percentage = Math.round((item.totalAmount / totalAmount) * 10000) / 100;
            });
        }

        return results;
    }
}
