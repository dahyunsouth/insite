"use client";

import React, { useEffect, useState, useRef } from "react";
import PopulationToggle from "@/components/molecules/Detail/PopulationCard/PopulationToggle";
import TimeSlotCard from "@/components/molecules/Detail/PopulationCard/FloatingPopulationCard";
import ResidentPopulationCard from "@/components/molecules/Detail/PopulationCard/ResidentPopulationCard";
import WorkPopulationGenderChart from "@/components/molecules/Detail/PopulationCard/Charts/WorkPopulationGenderChart";
import WorkPopulationAgeChart from "@/components/molecules/Detail/PopulationCard/Charts/WorkPopulationAgeChart";
import WorkPopulationInfoModal from "@/components/molecules/Detail/PopulationCard/InfoModal/WorkPopulationInfoModal";

type Props = { 
  trdarCode: string | null;
  populationType: "유동" | "직장" | "상주";
  onPopulationTypeChange: (type: "유동" | "직장" | "상주") => void;
};

type WorkResponse = {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    stdrYyquCd: string;
    trdarSeCd: string;
    trdarSeCdNm: string;
    trdarCd: number;
    trdarCdNm: string;
    totWrcPopltnCo: number;
    mlWrcPopltnCo: number;
    fmlWrcPopltnCo: number;
    agrde10WrcPopltnCo: number;
    agrde20WrcPopltnCo: number;
    agrde30WrcPopltnCo: number;
    agrde40WrcPopltnCo: number;
    agrde50WrcPopltnCo: number;
    agrde60AboveWrcPopltnCo: number;
    mag10WrcPopltnCo: number;
    mag20WrcPopltnCo: number;
    mag30WrcPopltnCo: number;
    mag40WrcPopltnCo: number;
    mag50WrcPopltnCo: number;
    mag60AboveWrcPopltnCo: number;
    fag10WrcPopltnCo: number;
    fag20WrcPopltnCo: number;
    fag30WrcPopltnCo: number;
    fag40WrcPopltnCo: number;
    fag50WrcPopltnCo: number;
    fag60AboveWrcPopltnCo: number;
  };
};

export default function WorkPopulationCard({ trdarCode, populationType, onPopulationTypeChange }: Props) {
  const [data, setData] = useState<WorkResponse | null>(null);
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
        const url = `/api/v1/data/info/wrc-popltn?trdarCd=${trdarCode}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("workers detail failed");
        const payload = (await res.json()) as WorkResponse;
        if (aborted) return;
        setData(payload);
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
  
  if (populationType === "상주") {
    return <ResidentPopulationCard trdarCode={trdarCode} populationType={populationType} onPopulationTypeChange={onPopulationTypeChange} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[18px] font-semibold text-gray-900">직장인구</h3>
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
            aria-label="직장인구 정보"
          >
            <span className="text-xs font-bold">i</span>
          </button>
          {data?.result?.stdrYyquCd && (
            <span className="text-xs text-gray-400">
              {data.result.stdrYyquCd.slice(0, 4)}년도 {data.result.stdrYyquCd.slice(4)}분기 기준
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
        {/* Total workers */}
        <KpiTile
          title="총 직장인구"
          primary={data ? `${formatNumber(data.result.totWrcPopltnCo)}명` : ""}
          secondary={
            data
              ? `남 ${formatPercent((data.result.mlWrcPopltnCo / data.result.totWrcPopltnCo) * 100)} · 여 ${formatPercent((data.result.fmlWrcPopltnCo / data.result.totWrcPopltnCo) * 100)}`
              : ""
          }
        />
        {/* Male count */}
        <KpiTile
          title="남성"
          primary={data ? `${formatNumber(data.result.mlWrcPopltnCo)}명` : ""}
          secondary={data ? `비중 ${formatPercent((data.result.mlWrcPopltnCo / data.result.totWrcPopltnCo) * 100)}` : ""}
        />
        {/* Female count */}
        <KpiTile
          title="여성"
          primary={data ? `${formatNumber(data.result.fmlWrcPopltnCo)}명` : ""}
          secondary={data ? `비중 ${formatPercent((data.result.fmlWrcPopltnCo / data.result.totWrcPopltnCo) * 100)}` : ""}
        />
      </div>

      {/* Gender composition */}
      {data ? (
        <div className="mt-4">
          <WorkPopulationGenderChart 
            maleRate={(data.result.mlWrcPopltnCo / data.result.totWrcPopltnCo) * 100} 
            femaleRate={(data.result.fmlWrcPopltnCo / data.result.totWrcPopltnCo) * 100}
            maleCount={data.result.mlWrcPopltnCo}
            femaleCount={data.result.fmlWrcPopltnCo}
          />
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-700">성별 구성</div>
          <div className="mt-2">
            <Placeholder />
          </div>
        </div>
      )}

      {/* Age distribution */}
      {data ? (
        <div className="mt-4">
          <WorkPopulationAgeChart data={data.result} />
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-700">연령대 분포</div>
          <div className="mt-2">
            <div className="h-[120px] flex items-center justify-center text-sm text-gray-400">데이터가 없습니다.</div>
          </div>
        </div>
      )}

      {/* Empty/Loading/Error */}
      {trdarCode == null ? (
        <div className="mt-3 text-sm text-gray-500">상권을 선택하면 직장인구를 보여드려요.</div>
      ) : loading ? (
        <div className="mt-3 text-sm text-gray-500">불러오는 중…</div>
      ) : error ? (
        <div className="mt-3 text-sm text-rose-600">데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</div>
      ) : null}

      {/* Info Modal */}
      <WorkPopulationInfoModal 
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


function Placeholder() {
  return <div className="h-3 w-full rounded-full bg-gray-100" />;
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




