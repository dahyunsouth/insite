'use client';

import React from 'react';

interface ProgressStep {
  id: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

interface MarketRecommendationProgressBarProps {
  currentStep: number;
  steps?: ProgressStep[];
}

const defaultSteps: ProgressStep[] = [
  { id: 1, label: '선호 행정구', isActive: true, isCompleted: false },
  { id: 2, label: '발달/골목 상권', isActive: false, isCompleted: false },
  { id: 3, label: '점포 규모', isActive: false, isCompleted: false },
  { id: 4, label: '임대료', isActive: false, isCompleted: false },
  { id: 5, label: '추천결과', isActive: false, isCompleted: false },
];

const MarketRecommendationProgressBar: React.FC<MarketRecommendationProgressBarProps> = ({
  currentStep,
  steps = defaultSteps,
}) => {
  const updatedSteps = steps.map((step, index) => ({
    ...step,
    isActive: index + 1 === currentStep,
    isCompleted: index + 1 < currentStep,
  }));

  return (
    <div className="p-4 scale-80">
      <div className="flex items-center justify-center space-x-3">
        {updatedSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold
                  transition-all duration-300 ease-in-out
                  ${step.isActive 
                    ? 'bg-[#3288FF] text-white' 
                    : step.isCompleted 
                      ? 'bg-[#3288FF]/40 text-white/20' 
                      : 'bg-[#3288FF]/40 text-white/20'
                  }
                `}
              >
                {step.id}
              </div>
              <span
                className={`
                  mt-1.5 text-xs font-medium text-center
                  ${step.isActive 
                    ? 'text-white' 
                    : 'text-white/20'
                  }
                `}
              >
                {step.label}
              </span>
            </div>
            
            {/* Connecting Line */}
            {index < updatedSteps.length - 1 && (
              <div className="flex-1 border-b border-white/20" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MarketRecommendationProgressBar;
