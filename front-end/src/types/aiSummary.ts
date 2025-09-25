// AI Summary API 응답 타입 정의
export interface AiSummaryResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    summary: string;
    features: string[];
  };
}

// API 호출을 위한 파라미터 타입
export interface AiSummaryParams {
  trdarCd: string;
}

// 컴포넌트에서 사용할 AI 데이터 타입
export interface AiSummaryData {
  summary: string;
  features: string[];
  isLoading: boolean;
  error: string | null;
}
