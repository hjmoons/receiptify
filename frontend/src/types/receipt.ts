export interface Receipt {
  id: number;
  type: 0 | 1 | 2; // 0: 지출, 1: 수입, 2: 이체
  cost: number;
  content: string;
  location?: string;
  transaction_date: string; // 거래 발생 날짜/시간
  created_at: string;
  updated_at: string;
  user_id: number;
  asset_id: number;
  trs_asset_id: number | null;
  category_id: number | null;
}

export interface ReceiptForm {
  type: 0 | 1 | 2;
  cost: number;
  content: string;
  location: string;
  transaction_date?: string; // 거래 발생 날짜/시간 (선택적)
  asset_id: number;
  trs_asset_id: number | null;
  category_id: number | null;
}
