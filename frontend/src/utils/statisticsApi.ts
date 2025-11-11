import api from './api';
import type { CategoryStatistics, MonthlyStatistics, CategoryTrend } from '../types/statistics';

export const statisticsApi = {
  /**
   * 카테고리별 통계 조회
   * @param year - 연도
   * @param month - 월 (1-12)
   * @param type - 거래 유형 (0: 지출, 1: 수입)
   */
  getCategoryStats: async (
    year: number,
    month: number,
    type: 0 | 1
  ): Promise<CategoryStatistics[]> => {
    const response = await api.get<{ success: boolean; data: CategoryStatistics[] }>(
      `/statistics/category`,
      {
        params: { year, month, type }
      }
    );
    return response.data.data;
  },

  /**
   * 월별 통계 조회
   * @param year - 연도
   * @param month - 월 (1-12)
   */
  getMonthlyStats: async (
    year: number,
    month: number
  ): Promise<MonthlyStatistics> => {
    const response = await api.get<{ success: boolean; data: MonthlyStatistics }>(
      `/statistics/monthly`,
      {
        params: { year, month }
      }
    );
    return response.data.data;
  },

  /**
   * 최근 N개월 월별 통계 조회
   * @param months - 조회할 개월 수 (기본값: 6)
   */
  getRecentMonthlyStats: async (months: number = 6): Promise<MonthlyStatistics[]> => {
    const response = await api.get<{ success: boolean; data: MonthlyStatistics[] }>(
      `/statistics/recent`,
      {
        params: { months }
      }
    );
    return response.data.data;
  },

  /**
   * 특정 카테고리의 월별 추이 조회
   * @param categoryId - 카테고리 ID
   * @param type - 거래 유형 (0: 지출, 1: 수입)
   * @param months - 조회할 개월 수 (기본값: 6)
   */
  getCategoryTrend: async (
    categoryId: number,
    type: 0 | 1,
    months: number = 6
  ): Promise<CategoryTrend[]> => {
    const response = await api.get<{ success: boolean; data: CategoryTrend[] }>(
      `/statistics/category/${categoryId}/trend`,
      {
        params: { type, months }
      }
    );
    return response.data.data;
  },

  /**
   * Top N 카테고리 조회
   * @param year - 연도
   * @param month - 월 (1-12)
   * @param type - 거래 유형 (0: 지출, 1: 수입)
   * @param limit - 조회할 개수 (기본값: 5)
   */
  getTopCategories: async (
    year: number,
    month: number,
    type: 0 | 1,
    limit: number = 5
  ): Promise<CategoryStatistics[]> => {
    const response = await api.get<{ success: boolean; data: CategoryStatistics[] }>(
      `/statistics/top`,
      {
        params: { year, month, type, limit }
      }
    );
    return response.data.data;
  }
};
