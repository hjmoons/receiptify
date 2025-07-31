// asset.ts
export interface Asset {
  id: number;
  user_id: number;
  name: string;
  type: 'account' | 'card';
  balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface AssetForm {
  name: string;
  type: 'account' | 'card';
  balance: number;
}

export interface AssetStyle {
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeColor: string;
  label: string;
}

export interface TotalAssetsResponse {
  totalValue: number;
}