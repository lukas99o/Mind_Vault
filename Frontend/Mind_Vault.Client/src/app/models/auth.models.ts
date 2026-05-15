export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface AuthResponse {
  token: string;
  expiresAtUtc: string;
}

export interface AuthSession {
  token: string;
  expiresAtUtc: string;
  email: string | null;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors: Record<string, string[]> | null;
}

export interface SeoMetadata {
  title: string;
  description: string;
  robots?: string;
}
