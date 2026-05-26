export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'super_admin' | 'admin' | 'user';
  status: 'active' | 'inactive' | 'banned';
  email_verified_at: string | null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string | null;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}
