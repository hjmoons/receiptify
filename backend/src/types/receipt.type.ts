export interface Receipt {
  id?: number;
  type: 0 | 1 | 2;
  cost: number;
  content: string;
  location: string;
  transaction_date: string; // 거래 발생 날짜/시간
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
    transaction_date?: string; // 선택적 (지정하지 않으면 현재 시간)
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
    transaction_date?: string; // 선택적 (수정 시)
    asset_id: number;
    trs_asset_id: number | null;
    category_id: number | null;
}