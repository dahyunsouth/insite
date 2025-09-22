"use client";

import React, { useEffect, useState, useRef } from "react";
import PopulationToggle from "@/components/molecules/Detail/PopulationCard/PopulationToggle";
import TimeSlotCard from "@/components/molecules/Detail/PopulationCard/FloatingPopulationCard";
import WorkPopulationCard from "@/components/molecules/Detail/PopulationCard/WorkPopulationCard";
import ResidentPopulationAgeChart from "./Charts/ResidentPopulationAgeChart";
import ResidentPopulationGenderChart from "./Charts/ResidentPopulationGenderChart";
import ResidentPopulationHomeTypeChart from "./Charts/ResidentPopulationHomeTypeChart";
import ResidentPopulationInfoModal from "@/components/molecules/Detail/PopulationCard/InfoModal/ResidentPopulationInfoModal";

type Props = { 
  trdarCode: string | null;
  populationType: "유동" | "직장" | "상주";
  onPopulationTypeChange: (type: "유동" | "직장" | "상주") => void;
};

type ResidentResponse = {
  stdrYyquCd: string;
  trdarSeCd: string;
  trdarSeCdNm: string;
  trdarCd: number;
  trdarCdNm: string;
  totRepopCo: number;
  mlRepopCo: number;
  fmlRepopCo: number;
  agrde10RepopCo: number;
  agrde20RepopCo: number;
  agrde30RepopCo: number;
  agrde40RepopCo: number;
  agrde50RepopCo: number;
  agrde60AboveRepopCo: number;
  mag10RepopCo: number;
  mag20RepopCo: number;
  mag30RepopCo: number;
  mag40RepopCo: number;
  mag50RepopCo: number;
  mag60AboveRepopCo: number;
  fag10RepopCo: number;
  fag20RepopCo: number;
  fag30RepopCo: number;
  fag40RepopCo: number;
  fag50RepopCo: number;
  fag60AboveRepopCo: number;
  totHshldCo: number;
  aptHshldCo: number;
  nonAptHshldCo: number;
};

export default function ResidentPopulationCard({ trdarCode, populationType, onPopulationTypeChange }: Props) {
  const [data, setData] = useState<ResidentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (!trdarCode) {
        setData(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const url = `/api/v1/data/info/repop?trdarCd=${trdarCode}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("residents detail failed");
        const response = await res.json();
        if (aborted) return;
        
        if (response.isSuccess && response.result) {
          setData(response.result);
        } else {
          throw new Error(response.message || "데이터를 불러오는데 실패했습니다.");
        }
      } catch (e: any) {
        if (!aborted) setError(e?.message ?? "load failed");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();
    return () => {
      aborted = true;
    };
  }, [trdarCode]);


  // 토글 상태에 따라 다른 카드 렌더링
  if (populationType === "유동") {
    return <TimeSlotCard trdarCode={trdarCode} populationType={populationType} onPopulationTypeChange={onPopulationTypeChange} />;
  }
  
  if (populationType === "직장") {
    return <WorkPopulationCard trdarCode={trdarCode} populationType={populationType} onPopulationTypeChange={onPopulationTypeChange} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[18px] font-semibold text-gray-900">상주인구</h3>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => {
              if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setModalPosition({
                  top: rect.top,
                  left: rect.right
                });
              }
              setIsInfoModalOpen(!isInfoModalOpen);
            }}
            className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-white transition-colors hover:bg-gray-400 active:bg-gray-600"
            aria-label="상주인구 정보"
          >
            <span className="text-xs font-bold">i</span>
          </button>
          {data?.stdrYyquCd && (
            <span className="text-xs text-gray-400">
              {data.stdrYyquCd.slice(0, 4)}년도 {data.stdrYyquCd.slice(4)}분기 기준
            </span>
          )}
        </div>
        <PopulationToggle
          selected={populationType}
          onChange={onPopulationTypeChange}
        />
      </div>

      {/* Grid KPIs */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total resident */}
        <KpiTile
          title="총 상주인구"
          primary={data ? `${formatNumber(data.totRepopCo)}명` : "—"}
          secondary={data ? `남 ${formatPercent((data.mlRepopCo / data.totRepopCo) * 100)} · 여 ${formatPercent((data.fmlRepopCo / data.totRepopCo) * 100)}` : "—"}
        />
        {/* Households */}
        <KpiTile
          title="총 가구 수"
          primary={data ? `${formatNumber(data.totHshldCo)}가구` : "—"}
          secondary={
            data && data.totHshldCo > 0
              ? `평균 가구원수 ${formatFixed(data.totRepopCo / data.totHshldCo, 1)}명`
              : "—"
          }
        />
        {/* Apt ratio */}
        <KpiTile
          title="아파트 비중"
          primaryClass="text-[#2563EB]"
          primary={data ? `${formatPercent((data.aptHshldCo / data.totHshldCo) * 100)}` : "—"}
          secondary={data ? `아파트 ${formatNumber(data.aptHshldCo)} · 비아파트 ${formatNumber(data.nonAptHshldCo)}` : "—"}
        />
      </div>

      {/* Gender and dwelling composition */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <ResidentPopulationGenderChart data={data} />
        <ResidentPopulationHomeTypeChart data={data} />
      </div>

      {/* Age distribution */}
      <ResidentPopulationAgeChart data={data} />

      {/* Empty/Loading/Error */}
      {trdarCode == null ? (
        <div className="mt-3 text-sm text-gray-500">상권을 선택하면 상주인구를 보여드려요.</div>
      ) : loading ? (
        <div className="mt-3 text-sm text-gray-500">불러오는 중…</div>
      ) : error ? (
        <div className="mt-3 text-sm text-rose-600">데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</div>
      ) : null}

      {/* Info Modal */}
      <ResidentPopulationInfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)}
        position={modalPosition}
      />
    </div>
  );
}

function KpiTile({ title, primary, secondary, primaryClass = "" }: { title: string; primary: string; secondary: string; primaryClass?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-sm font-semibold text-gray-700">{title}</div>
      <div className={`mt-2 text-[22px] font-bold text-gray-900 ${primaryClass}`}>{primary}</div>
      <div className="mt-1 text-xs text-gray-500">{secondary}</div>
    </div>
  );
}


function formatNumber(v: number) {
  try {
    return v.toLocaleString();
  } catch {
    return String(v);
  }
}

function formatPercent(v: number) {
  const digits = Math.abs(v) < 10 ? 1 : 0;
  return `${v.toFixed(digits)}%`;
}

function formatFixed(v: number, d = 1) {
  return Number.isFinite(v) ? v.toFixed(d) : "—";
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

