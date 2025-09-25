"use client";

import React, { useState, useEffect } from "react";
import { getAiSummary } from '@/lib/api/aiSummary';
import { AiSummaryData } from '@/types/aiSummary';

type AiPromptProps = {
  areaName?: string;
  trdarCode?: string | null;
  ranking?: number;
};

/**
 * Atom: AiPrompt
 * - AI가 생성한 상권 소개 텍스트를 표시하는 컴포넌트
 * - 하드코딩된 상권 소개 내용을 제공
 */
export default function AiPrompt({ areaName, trdarCode, ranking }: AiPromptProps) {
  // AI 요약 정보 상태 관리
  const [aiData, setAiData] = useState<AiSummaryData>({
    summary: '',
    features: [],
    isLoading: true,
    error: null
  });

  // AI 요약 정보를 가져오는 함수
  const fetchAiSummary = async () => {
    if (!trdarCode) {
      setAiData({
        summary: '',
        features: [],
        isLoading: false,
        error: '상권 코드가 없습니다.'
      });
      return;
    }

    try {
      setAiData(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await getAiSummary(trdarCode);
      
      if (result) {
        setAiData({
          summary: result.summary,
          features: result.features,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error('AI 요약 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      setAiData({
        summary: '',
        features: [],
        isLoading: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  };

  // 컴포넌트 마운트 시 AI 데이터 로드
  useEffect(() => {
    fetchAiSummary();
  }, [trdarCode]);
  // 등수별 색상 스타일
  const getRankingStyle = (ranking?: number) => {
    switch (ranking) {
      case 1:
        return {
          gradient: 'from-orange-50 to-orange-100',
          border: 'border-orange-200',
          iconBg: 'bg-orange-500',
          dotColor: 'bg-orange-500',
          textColor: 'text-orange-600',
          borderColor: 'border-orange-200'
        };
      case 2:
        return {
          gradient: 'from-blue-50 to-blue-100',
          border: 'border-blue-200',
          iconBg: 'bg-blue-500',
          dotColor: 'bg-blue-500',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200'
        };
      case 3:
        return {
          gradient: 'from-green-50 to-green-100',
          border: 'border-green-200',
          iconBg: 'bg-green-500',
          dotColor: 'bg-green-500',
          textColor: 'text-green-600',
          borderColor: 'border-green-200'
        };
      default:
        return {
          gradient: 'from-blue-50 to-indigo-50',
          border: 'border-blue-100',
          iconBg: 'bg-blue-500',
          dotColor: 'bg-blue-500',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200'
        };
    }
  };

  const style = getRankingStyle(ranking);

  // Fallback 텍스트 (API 실패 시 사용)
  const getFallbackText = (areaName?: string) => {
    if (!areaName) {
      return {
        title: "상권 분석 결과",
        content: "이 상권은 다양한 상업시설과 인프라가 잘 갖춰진 지역으로, 상권의 특성과 잠재력을 분석한 결과를 제공합니다.",
        highlights: [
          "주변 인구밀도가 높아 상권 활성도가 우수합니다",
          "교통 접근성이 좋아 유동인구가 많습니다",
          "다양한 업종의 상점들이 입지하고 있어 경쟁이 치열합니다"
        ]
      };
    }

    return {
      title: `${areaName} 상권 분석`,
      content: `${areaName}은(는) 도시의 핵심 상권 중 하나로, 높은 상권 활성도와 다양한 상업시설을 보유하고 있습니다. 이 지역의 상권 특성과 잠재력을 종합적으로 분석한 결과를 제공합니다.`,
      highlights: [
        `${areaName} 주변의 인구밀도가 높아 상권 활성도가 우수합니다`,
        `교통 접근성이 좋아 유동인구가 많고, 상권의 지속적인 성장이 기대됩니다`,
        `다양한 업종의 상점들이 입지하고 있어 경쟁이 치열하지만, 동시에 상권의 다양성을 제공합니다`,
        `주변 인프라가 잘 갖춰져 있어 상권의 안정성이 높습니다`
      ]
    };
  };

  const fallbackData = getFallbackText(areaName);
  
  // 표시할 데이터 결정 (API 데이터 우선, 실패 시 fallback)
  const displayData = {
    title: fallbackData.title,
    content: aiData.summary || fallbackData.content,
    highlights: aiData.features.length > 0 ? aiData.features : fallbackData.highlights
  };

  return (
    <div className="w-full h-full">
      <div className={`bg-gradient-to-r ${style.gradient} rounded-lg p-6 border ${style.border} h-full flex flex-col relative overflow-hidden`}>
        
        <div className="flex items-center mb-4">
          <div className={`w-8 h-8 ${style.iconBg} rounded-full flex items-center justify-center mr-3`}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-800">{displayData.title}</h4>
        </div>
        
        {/* 메인 콘텐츠 - 따옴표와 함께 */}
        <div className="flex-1 flex flex-col relative">
          {/* 왼쪽 따옴표 */}
          <div className="absolute top-0 left-0 text-4xl font-bold text-orange-300 opacity-70">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" transform="rotate(180)">
              <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"/>
            </svg>
          </div>
          
          {/* 오른쪽 따옴표 */}
          <div className="absolute bottom-0 right-0 text-4xl font-bold text-orange-300 opacity-70">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"/>
            </svg>
          </div>
          
          {/* 텍스트 내용 */}
          <div className="px-10 py-4 flex-1 flex flex-col">
            {aiData.isLoading ? (
              <div className="flex items-center gap-2 text-gray-700 mb-4 leading-relaxed">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>AI 분석 중...</span>
              </div>
            ) : aiData.error ? (
              <p className="text-red-500 mb-4 leading-relaxed">AI 분석 정보를 불러올 수 없습니다.</p>
            ) : (
              <p className="text-gray-700 mb-4 leading-relaxed text-justify">{displayData.content}</p>
            )}
            
            <div className="space-y-2 flex-1">
              <h5 className="text-sm font-bold text-gray-600 mb-2">📋 주요 특징:</h5>
              <ul className="space-y-1">
                {aiData.isLoading ? (
                  <li className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                    <span>특징 분석 중...</span>
                  </li>
                ) : aiData.error ? (
                  <li className="text-sm text-red-500">특징 정보를 불러올 수 없습니다.</li>
                ) : (
                  displayData.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <span className={`w-1.5 h-1.5 ${style.dotColor} rounded-full mt-2 mr-2 flex-shrink-0`}></span>
                      {highlight}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
        
        {/* 하단 AI 분석 결과 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            AI 분석 결과
          </div>
        </div>
      </div>
    </div>
  );
}
