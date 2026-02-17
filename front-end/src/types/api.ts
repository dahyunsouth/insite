/** 백엔드 공통 API 응답 형식 */
export interface ApiResponse<T = unknown> {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: T;
}

/** catch 블록에서 에러 메시지를 안전하게 추출 */
export function getErrorMessage(error: unknown, fallback = '알 수 없는 오류가 발생했습니다.'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}
