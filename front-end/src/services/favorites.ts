import { authManager } from '@/utils/auth';
import { API_BASE_URL } from '@/config/api';

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
    console.log('🌐 [FavoritesService] saveFavorite API 호출 시작');
    console.log('🌐 [FavoritesService] 상권 코드:', trdarCd);
    console.log('🌐 [FavoritesService] API URL:', `${API_BASE_URL}/api/v1/favorites?trdarCd=${trdarCd}`);
    
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

      console.log('🌐 [FavoritesService] API 응답 상태:', response.status);
      console.log('🌐 [FavoritesService] API 응답 OK:', response.ok);

      if (!response.ok) {
        console.error('❌ [FavoritesService] API 응답 실패:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<null> = await response.json();
      console.log('✅ [FavoritesService] API 응답 데이터:', data);
      return data;
    } catch (error) {
      console.error('❌ [FavoritesService] 상권 저장 실패:', error);
      throw error;
    }
  }

  // 상권 저장 해제
  async removeFavorite(trdarCd: number): Promise<ApiResponse<null>> {
    console.log('🌐 [FavoritesService] removeFavorite API 호출 시작');
    console.log('🌐 [FavoritesService] 상권 코드:', trdarCd);
    console.log('🌐 [FavoritesService] API URL:', `${API_BASE_URL}/api/v1/favorites/${trdarCd}`);
    
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

      console.log('🌐 [FavoritesService] API 응답 상태:', response.status);
      console.log('🌐 [FavoritesService] API 응답 OK:', response.ok);

      if (!response.ok) {
        console.error('❌ [FavoritesService] API 응답 실패:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<null> = await response.json();
      console.log('✅ [FavoritesService] API 응답 데이터:', data);
      return data;
    } catch (error) {
      console.error('❌ [FavoritesService] 상권 저장 해제 실패:', error);
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
