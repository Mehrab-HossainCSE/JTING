export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
  errorCode: string | null;
  traceId: string | null;
}