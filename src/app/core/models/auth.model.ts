 export interface LoginResponse {
    name: string;           // "foysal"
    token: string;
    expiresAt: string;      // "0001-01-01T00:00:00"
    refreshToken: string;
    refreshExpiresAt: string | null;
  }

  export interface LoginRequest {
    userName: string;
    password: string;
  }