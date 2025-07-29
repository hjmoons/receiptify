export interface Asset {
  id?: number;
  name: string;
  type: string;
  balance: number;
  created_at?: string;
  updated_at?: string;
  user_id: number;
}

export interface CreateDTO {
    name: string;
    type: string;
    balance: number;
    user_id: number;
}

export interface UpdateDTO {
    id: number;
    name?: string;
    type?: string;
    balance?: number;
}
