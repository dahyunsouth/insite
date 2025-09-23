import { API_ENDPOINTS } from '@/config/api';
import { AiSummaryResponse, AiSummaryParams } from '@/types/aiSummary';

/**
 * AI 상권 요약 정보를 가져오는 API 호출 함수
 * @param params - 상권 코드가 포함된 파라미터
 * @returns AI 요약 정보 응답
 */
export async function fetchAiSummary(params: AiSummaryParams): Promise<AiSummaryResponse> {
  const { trdarCd } = params;
  
  if (!trdarCd) {
    throw new Error('상권 코드가 필요합니다.');
  }

  const url = `${API_ENDPOINTS.AI_SUMMARY}/${trdarCd}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 실시간 데이터를 위해 캐시 비활성화
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
    }

    const data: AiSummaryResponse = await response.json();
    
    if (!data.isSuccess) {
      throw new Error(data.message || 'AI 요약 정보를 가져올 수 없습니다.');
    }

    return data;
  } catch (error) {
    console.error('AI Summary API 호출 에러:', error);
    throw error;
  }
}

/**
 * AI 상권 요약 정보를 가져오는 함수 (에러 처리 포함)
 * @param trdarCd - 상권 코드
 * @returns AI 요약 정보 또는 null (에러 시)
 */
export async function getAiSummary(trdarCd: string): Promise<AiSummaryResponse['result'] | null> {
  try {
    const response = await fetchAiSummary({ trdarCd });
    return response.result;
  } catch (error) {
    console.warn(`상권 코드 ${trdarCd}에 대한 AI 요약 정보를 가져올 수 없습니다:`, error);
    return null;
  }
}
