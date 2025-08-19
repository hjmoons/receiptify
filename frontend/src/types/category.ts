export interface Category {
  id: number;
  name: string;
  type: 0 | 1; // 0: 지출, 1: 수입
  level: 1 | 2 | 3;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export interface CategoryTree {
  id: number;
  name: string;
  type: 0 | 1;
  level: 1 | 2 | 3;
  children: CategoryTree[];
}