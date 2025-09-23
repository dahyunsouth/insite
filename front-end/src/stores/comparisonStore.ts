import { create } from 'zustand';

export interface ComparisonItem {
  trdarCd: string;
  trdarCdNm: string;
}

interface ComparisonState {
  comparisonTray: ComparisonItem[];
  addToComparison: (trdarCd: string, trdarCdNm: string) => void;
  removeFromComparison: (trdarCd: string) => void;
  isInComparison: (trdarCd: string) => boolean;
  clearComparison: () => void;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  comparisonTray: [],

  addToComparison: (trdarCd: string, trdarCdNm: string) => {
    const { comparisonTray } = get();
    
    // 이미 있는 상권인지 확인
    const exists = comparisonTray.some(item => item.trdarCd === trdarCd);
    if (exists) {
      console.log('비교함에 이미 존재하는 상권입니다:', trdarCdNm);
      return;
    }
    
    // 최대 2개까지만 추가 가능
    if (comparisonTray.length >= 2) {
      console.log('비교함이 가득참 - 최대 2개까지만 담을 수 있습니다. 시도한 상권:', trdarCdNm);
      return;
    }
    
    console.log('비교함에 상권 추가 성공:', trdarCdNm);
    set(state => ({
      comparisonTray: [...state.comparisonTray, { trdarCd, trdarCdNm }]
    }));
  },

  removeFromComparison: (trdarCd: string) => {
    const { comparisonTray } = get();
    const removedItem = comparisonTray.find(item => item.trdarCd === trdarCd);
    
    if (removedItem) {
      console.log('비교함에서 상권 제거:', removedItem.trdarCdNm);
    }
    
    set(state => ({
      comparisonTray: state.comparisonTray.filter(item => item.trdarCd !== trdarCd)
    }));
  },

  isInComparison: (trdarCd: string) => {
    const { comparisonTray } = get();
    return comparisonTray.some(item => item.trdarCd === trdarCd);
  },

  clearComparison: () => {
    console.log('비교함 전체 초기화');
    set({ comparisonTray: [] });
  }
}));
