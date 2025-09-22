"use client";

import React from "react";

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

  // 하드코딩된 AI 상권 소개 텍스트
  const getAiIntroText = (areaName?: string) => {
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

  const aiData = getAiIntroText(areaName);

  return (
    <div className="w-full h-full">
      <div className={`bg-gradient-to-r ${style.gradient} rounded-lg p-6 border ${style.border} h-full flex flex-col`}>
        <div className="flex items-center mb-4">
          <div className={`w-8 h-8 ${style.iconBg} rounded-full flex items-center justify-center mr-3`}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-800">{aiData.title}</h4>
        </div>
        
        <div className="flex-1 flex flex-col">
          <p className="text-gray-700 mb-4 leading-relaxed">
            {aiData.content}
          </p>
          
          <div className="space-y-2 flex-1">
            <h5 className="text-sm font-medium text-gray-600 mb-2">주요 특징:</h5>
            <ul className="space-y-1">
              {aiData.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <span className={`w-1.5 h-1.5 ${style.dotColor} rounded-full mt-2 mr-2 flex-shrink-0`}></span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className={`mt-4 pt-4 border-t ${style.borderColor}`}>
          <div className={`flex items-center text-xs ${style.textColor}`}>
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
