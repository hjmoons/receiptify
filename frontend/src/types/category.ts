export interface Category {
  id: number;
  name: string;
  type: number; // 0: 지출, 1: 수입
  level: number;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export interface CategoryTree {
  id: number;
  name: string;
  type: number;
  level: number;
  children: CategoryTree[];
}