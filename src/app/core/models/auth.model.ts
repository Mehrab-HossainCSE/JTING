export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
  errors: string[] | null;
  errorCode: string | null;
  traceId: string | null;
}

export interface LoginData {
  name: string;
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string | null;
}

export interface LoginRequest {
  userName: string;
  password: string;
}