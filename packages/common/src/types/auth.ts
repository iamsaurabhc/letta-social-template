export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error: Error | null;
}

export interface User {
  id: string;
  email?: string;
  created_at?: string;
}

export interface Error {
  message: string;
  status: number;
} 