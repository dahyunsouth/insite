import { authManager } from '@/utils/auth';

// API 응답 타입 정의
interface ApiResponse<T = any> {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: T;
}

interface FavoriteItem {
  id: number;
  userUuid: string;
  trdarCd: number;
  createdAt: string;
}

interface FavoritesResult {
  favorites: FavoriteItem[];
}

// API 기본 URL (이미지에서 확인한 서버 주소)
const API_BASE_URL = 'http://43.203.196.29:8080';

class FavoritesService {
  // 저장된 상권 목록 조회
  async getFavorites(): Promise<ApiResponse<FavoritesResult>> {
    try {
      const response = await authManager.authenticatedRequest(
        `${API_BASE_URL}/api/v1/favorites`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<FavoritesResult> = await response.json();
      return data;
    } catch (error) {
      console.error('저장된 상권 목록 조회 실패:', error);
      throw error;
    }
  }

  // 상권 저장
  async saveFavorite(trdarCd: number): Promise<ApiResponse<null>> {
    try {
      const response = await authManager.authenticatedRequest(
        `${API_BASE_URL}/api/v1/favorites?trdarCd=${trdarCd}`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<null> = await response.json();
      return data;
    } catch (error) {
      console.error('상권 저장 실패:', error);
      throw error;
    }
  }

  // 상권 저장 해제
  async removeFavorite(trdarCd: number): Promise<ApiResponse<null>> {
    try {
      const response = await authManager.authenticatedRequest(
        `${API_BASE_URL}/api/v1/favorites/${trdarCd}`,
        {
          method: 'DELETE',
          headers: {
            'accept': '*/*',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<null> = await response.json();
      return data;
    } catch (error) {
      console.error('상권 저장 해제 실패:', error);
      throw error;
    }
  }

  // 특정 상권이 저장되어 있는지 확인
  async isFavorite(trdarCd: number): Promise<boolean> {
    try {
      const response = await this.getFavorites();
      if (response.isSuccess && response.result?.favorites) {
        return response.result.favorites.some(fav => fav.trdarCd === trdarCd);
      }
      return false;
    } catch (error) {
      console.error('상권 저장 상태 확인 실패:', error);
      return false;
    }
  }

}

export const favoritesService = new FavoritesService();
export default favoritesService;
