export interface Receipt {
  id?: number;
  type: 0 | 1 | 2;
  cost: number;
  content: string;
  location: string;
  created_at?: string;
  updated_at?: string;
  user_id: number;
  asset_id: number;
  trs_asset_id: number | null;
  category_id: number | null;
}

export interface CreateDTO {
    type: 0 | 1 | 2;
    cost: number;
    content: string;
    location: string;
    user_id: number;
    asset_id: number;
    trs_asset_id: number | null;
    category_id: number | null;
}

export interface UpdateDTO {
    id: number;
    type: 0 | 1 | 2;
    cost: number;
    content: string;
    location: string;
    asset_id: number;
    trs_asset_id: number | null;
    category_id: number | null;
}