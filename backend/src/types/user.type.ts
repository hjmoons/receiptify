export interface User {
  id?: number;
  email: string;
  password: string;
  name: string;
  created_at?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface JwtPayload {
  userId: number;
}
