export interface Category {
  id?: number;
  parent_id: number | null;
  name: string;
  type: 0 | 1;  // 0: 지출, 1: 수입
  level: 1 | 2 | 3;
  user_id: number;
}

export interface CreateDTO {
    parent_id: number | null;
    name: string;
    type: 0 | 1;
    level: 1 | 2 | 3;
    user_id: number;
}

export interface UpdateDTO {
    id: number;
    parent_id?: number | null;
    name?: string;
}