"use client";

import React from "react";
import TimeSlotCard from "@/components/molecules/Detail/PopulationCard/FloatingPopulationCard";
import StoreCard from "@/components/molecules/Detail/StoreCard/StoreCard";
import ScoreCard from "@/components/molecules/Detail/ScoreCard/ScoreCard";
import SalesCard from "@/components/molecules/Detail/SalesCard/SalesCard";
import MarketChangeIndicatorCard from "@/components/molecules/Detail/MarketChangeIndicator/MarketChangeIndicatorCard";
import TradeAreaIntroCard from "@/components/molecules/Detail/TradeAreaIntroCard";

type DetailContentProps = {
  trdarCode?: string | null | undefined;
  populationType: "유동" | "직장" | "상주";
  onPopulationTypeChange: (type: "유동" | "직장" | "상주") => void;
  areaName?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  onViewLargeMap?: () => void;
  ranking?: number;
  showActionButtons?: boolean;
  onSave?: () => void;
  onCompare?: () => void;
  isSaved?: boolean;
  isComparing?: boolean;
  isLoading?: boolean;
  actionButtonsDirection?: 'horizontal' | 'vertical';
};

/**
 * Organism: DetailContent
 * - Manages the left side content sections of the detail modal
 * - Contains all the data visualization cards
 */
export default function DetailContent({ 
  trdarCode, 
  populationType, 
  onPopulationTypeChange,
  areaName,
  coordinates,
  onViewLargeMap,
  ranking,
  showActionButtons = false,
  onSave,
  onCompare,
  isSaved = false,
  isComparing = false,
  isLoading = false,
  actionButtonsDirection = 'vertical'
}: DetailContentProps) {
  return (
    <div className="space-y-3">
      <section id="intro-section" className="scroll-mt-64">
        <div className="rounded-[30px] border border-[#D9D9D9] overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="p-[30px]">
            <TradeAreaIntroCard 
              trdarCode={trdarCode}
              areaName={areaName}
              coordinates={coordinates}
              onViewLargeMap={onViewLargeMap}
              ranking={ranking}
              showActionButtons={showActionButtons}
              onSave={onSave}
              onCompare={onCompare}
              isSaved={isSaved}
              isComparing={isComparing}
              isLoading={isLoading}
              actionButtonsDirection={actionButtonsDirection}
            />
          </div>
        </div>
      </section>
      <section id="score-section" className="scroll-mt-64">
        <div className="rounded-[30px] border border-[#D9D9D9] overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="p-[30px]">
            <ScoreCard trdarCode={trdarCode ?? null} trdarCdNm={areaName} />
          </div>
        </div>
      </section>
      <section id="market-change-section" className="scroll-mt-64">
        <div className="rounded-[30px] border border-[#D9D9D9] overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="p-[30px]">
            <MarketChangeIndicatorCard trdarCode={trdarCode ?? null} />
          </div>
        </div>
      </section>
      <section id="pop-section" className="scroll-mt-64">
        <div className="rounded-[30px] border border-[#D9D9D9] overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="p-[30px]">
            <TimeSlotCard 
              trdarCode={trdarCode ?? null} 
              populationType={populationType}
              onPopulationTypeChange={onPopulationTypeChange}
            />
          </div>
        </div>
      </section>
      <section id="sales-section" className="scroll-mt-64">
        <div className="rounded-[30px] border border-[#D9D9D9] overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="p-[30px]">
            <SalesCard trdarCode={trdarCode ?? null} />
          </div>
        </div>
      </section>
      <section id="store-section" className="scroll-mt-64">
        <div className="rounded-[30px] border border-[#D9D9D9] overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="p-[30px]">
            <StoreCard trdarCode={trdarCode ?? null} />
          </div>
        </div>
      </section>
    </div>
  );
}
