export interface CategoryStatistics {
  categoryId: number;
  categoryName: string;
  categoryLevel: number;
  parentId: number | null;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface MonthlyStatistics {
  year: number;
  month: number;
  totalExpenditure: number;
  totalIncome: number;
  balance: number;
  transactionCount: number;
}

export interface CategoryTrend {
  year: number;
  month: number;
  totalAmount: number;
}

export type TransactionType = 0 | 1; // 0: expense, 1: income
