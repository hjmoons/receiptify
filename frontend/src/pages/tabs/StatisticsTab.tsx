import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { statisticsApi } from '../../utils/statisticsApi';
import type { CategoryStatistics, MonthlyStatistics } from '../../types/statistics';

type TransactionType = 'income' | 'expense';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

export default function StatisticsTab() {
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryStats, setCategoryStats] = useState<CategoryStatistics[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyStatistics[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 년도/월 가져오기
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    loadStatistics();
  }, [type]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const transactionType = type === 'expense' ? 0 : 1;

      // 병렬로 데이터 로드
      const [categoryData, trendData, topData] = await Promise.all([
        statisticsApi.getCategoryStats(currentYear, currentMonth, transactionType),
        statisticsApi.getRecentMonthlyStats(6),
        statisticsApi.getTopCategories(currentYear, currentMonth, transactionType, 5)
      ]);

      setCategoryStats(categoryData);
      setMonthlyTrend(trendData);
      setTopCategories(topData);
    } catch (err) {
      if (import.meta.env.DEV) console.error('통계 로드 실패:', err);
      setError('통계 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 파이 차트 데이터 변환 (1레벨 카테고리만)
  const pieChartData = categoryStats
    .filter(stat => stat.categoryLevel === 1)
    .map(stat => ({
      name: stat.categoryName,
      value: stat.totalAmount,
      percentage: stat.percentage
    }));

  // 바 차트 데이터 변환 (최근 6개월)
  const barChartData = monthlyTrend.map(stat => ({
    name: `${stat.month}월`,
    금액: type === 'expense' ? stat.totalExpenditure : stat.totalIncome
  }));

  // 금액 포맷팅
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 수입/지출 전환 버튼 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {type === 'expense' ? '지출 통계' : '수입 통계'}
        </h3>
        <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
          <button
            onClick={() => setType('income')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              type === 'income'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            수입
          </button>
          <button
            onClick={() => setType('expense')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              type === 'expense'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            지출
          </button>
        </div>
      </div>

      {/* 통계 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 카테고리별 파이 차트 */}
        <div className="bg-white border p-6 rounded-lg shadow-sm">
          <h4 className="font-semibold mb-4">
            카테고리별 {type === 'expense' ? '지출' : '수입'}
          </h4>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${entry.percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              데이터가 없습니다
            </div>
          )}
        </div>

        {/* 월별 추이 바 차트 */}
        <div className="bg-white border p-6 rounded-lg shadow-sm">
          <h4 className="font-semibold mb-4">
            월별 {type === 'expense' ? '지출' : '수입'} 추이 (최근 6개월)
          </h4>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="금액" fill={type === 'expense' ? '#FF8042' : '#00C49F'} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              데이터가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* Top 5 목록 */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h4 className="font-semibold mb-4">
          이번 달 Top 5 {type === 'expense' ? '지출' : '수입'}
        </h4>
        <div className="space-y-2">
          {topCategories.length > 0 ? (
            topCategories.map((category, index) => (
              <div key={category.categoryId} className="flex justify-between items-center py-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 font-medium">{category.categoryName}</span>
                  <span className="text-xs text-gray-500">({category.transactionCount}건)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(category.totalAmount)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              데이터가 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}