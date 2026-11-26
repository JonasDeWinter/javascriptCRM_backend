export interface ApiSuccessResponse<T> {
  success: true;
  result: T;
}

export interface ApiErrorResponse {
  success: false;
  errorCode: number;
  result: {
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function apiSuccess<T>(result: T): ApiSuccessResponse<T> {
  return { success: true, result };
}

export function apiError(errorCode: number, message: string): ApiErrorResponse {
  return { success: false, errorCode, result: { message } };
}
