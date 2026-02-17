'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { favoritesService } from '@/services/favorites';
import { authManager } from '@/utils/auth';
import { getTradeAreaNameByCode } from '@/lib/api/tradeAreas';
import { logger } from '@/utils/logger';

// 타입 정의
interface TradeAreaData {
  trdarCd: string;
  trdarCdNm: string;
}

interface FavoritesState {
  favorites: TradeAreaData[];
  isLoading: boolean;
  error: string | null;
}

type FavoritesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FAVORITES'; payload: TradeAreaData[] }
  | { type: 'ADD_FAVORITE'; payload: TradeAreaData }
  | { type: 'REMOVE_FAVORITE'; payload: string } // trdarCd
  | { type: 'CLEAR_FAVORITES' };

// 초기 상태
const initialState: FavoritesState = {
  favorites: [],
  isLoading: false,
  error: null,
};

// Reducer
function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload, isLoading: false, error: null };
    case 'ADD_FAVORITE':
      return { 
        ...state, 
        favorites: [...state.favorites, action.payload],
        error: null 
      };
    case 'REMOVE_FAVORITE':
      return { 
        ...state, 
        favorites: state.favorites.filter(fav => fav.trdarCd !== action.payload),
        error: null 
      };
    case 'CLEAR_FAVORITES':
      return { ...state, favorites: [], error: null };
    default:
      return state;
  }
}

// Context 타입
interface FavoritesContextType {
  favorites: TradeAreaData[];
  isLoading: boolean;
  error: string | null;
  addFavorite: (trdarCd: number, trdarCdNm: string) => Promise<void>;
  removeFavorite: (trdarCd: number) => Promise<void>;
  refreshFavorites: () => Promise<void>;
  isFavorite: (trdarCd: number) => boolean;
}

// Context 생성
const FavoritesContext = createContext<FavoritesContextType | null>(null);

// Provider Props
interface FavoritesProviderProps {
  children: ReactNode;
}

// Provider 컴포넌트
export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // 저장된 상권 목록 조회
  const refreshFavorites = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // 로그인 확인
      if (!authManager.isLoggedIn()) {
        dispatch({ type: 'SET_FAVORITES', payload: [] });
        return;
      }

      // API 호출
      const favoritesResponse = await favoritesService.getFavorites();

      if (!favoritesResponse.isSuccess || !favoritesResponse.result?.favorites) {
        dispatch({ type: 'SET_FAVORITES', payload: [] });
        return;
      }

      const savedFavorites = favoritesResponse.result.favorites;

      if (savedFavorites.length === 0) {
        dispatch({ type: 'SET_FAVORITES', payload: [] });
        return;
      }

      // 상권코드로 상권명 조회하여 변환
      const tradeAreasWithNames = savedFavorites
        .map((fav) => {
          const trdarCdNm = getTradeAreaNameByCode(fav.trdarCd.toString());
          if (!trdarCdNm || trdarCdNm === "상권명 없음") {
            return null;
          }
          return {
            trdarCd: fav.trdarCd.toString(),
            trdarCdNm
          };
        })
        .filter((area): area is TradeAreaData => area !== null);

      dispatch({ type: 'SET_FAVORITES', payload: tradeAreasWithNames });
    } catch (error) {
      logger.error('저장된 상권 목록 조회 실패:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: '저장된 상권 목록을 불러올 수 없습니다.'
      });
    }
  }, []);

  // 상권 저장
  const addFavorite = useCallback(async (trdarCd: number, trdarCdNm: string) => {
    logger.info('💾 [FavoritesContext] addFavorite 시작');
    logger.info('💾 [FavoritesContext] 상권 코드:', trdarCd);
    logger.info('💾 [FavoritesContext] 상권명:', trdarCdNm);

    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      // API 호출
      logger.info('💾 [FavoritesContext] API 호출 시작 - saveFavorite');
      await favoritesService.saveFavorite(trdarCd);
      logger.info('✅ [FavoritesContext] API 호출 성공');

      // 로컬 상태 업데이트
      logger.info('💾 [FavoritesContext] 로컬 상태 업데이트');
      dispatch({
        type: 'ADD_FAVORITE',
        payload: { trdarCd: trdarCd.toString(), trdarCdNm }
      });
      logger.info('✅ [FavoritesContext] addFavorite 완료');
    } catch (error) {
      logger.error('❌ [FavoritesContext] 상권 저장 실패:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : '상권 저장에 실패했습니다.'
      });
      throw error; // 호출한 컴포넌트에서 에러 처리할 수 있도록
    }
  }, []);

  // 상권 저장 해제
  const removeFavorite = useCallback(async (trdarCd: number) => {
    logger.info('💾 [FavoritesContext] removeFavorite 시작');
    logger.info('💾 [FavoritesContext] 상권 코드:', trdarCd);

    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      // API 호출
      logger.info('💾 [FavoritesContext] API 호출 시작 - removeFavorite');
      await favoritesService.removeFavorite(trdarCd);
      logger.info('✅ [FavoritesContext] API 호출 성공');

      // 로컬 상태 업데이트
      logger.info('💾 [FavoritesContext] 로컬 상태 업데이트');
      dispatch({
        type: 'REMOVE_FAVORITE',
        payload: trdarCd.toString()
      });
      logger.info('✅ [FavoritesContext] removeFavorite 완료');
    } catch (error) {
      logger.error('❌ [FavoritesContext] 상권 저장 해제 실패:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : '상권 저장 해제에 실패했습니다.'
      });
      throw error; // 호출한 컴포넌트에서 에러 처리할 수 있도록
    }
  }, []);

  // 특정 상권이 저장되어 있는지 확인
  const isFavorite = useCallback((trdarCd: number): boolean => {
    return state.favorites.some(fav => fav.trdarCd === trdarCd.toString());
  }, [state.favorites]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const value = useMemo<FavoritesContextType>(() => ({
    favorites: state.favorites,
    isLoading: state.isLoading,
    error: state.error,
    addFavorite,
    removeFavorite,
    refreshFavorites,
    isFavorite,
  }), [state.favorites, state.isLoading, state.error, addFavorite, removeFavorite, refreshFavorites, isFavorite]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Custom Hook
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

export { FavoritesContext };
export default FavoritesContext;
