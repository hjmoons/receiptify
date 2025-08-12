export interface User {
  id?: number;
  email: string;
  password: string;
  name: string;
  created_at?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface JwtPayload {
  userId: number;
}
