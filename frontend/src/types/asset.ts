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

export interface AssetsTabProps {
  user: {
    id: string;
    name: string;
  };
}

// API 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}
