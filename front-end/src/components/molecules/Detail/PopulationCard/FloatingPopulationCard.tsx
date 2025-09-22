"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import FloatingPopulationTimeChart from "@/components/molecules/Detail/PopulationCard/Charts/FloatingPopulationTimeChart";
import FloatingPopulationWeekChart from "@/components/molecules/Detail/PopulationCard/Charts/FloatingPopulationWeekChart";
import PopulationToggle from "@/components/molecules/Detail/PopulationCard/PopulationToggle";
import WorkPopulationCard from "@/components/molecules/Detail/PopulationCard/WorkPopulationCard";
import ResidentPopulationCard from "@/components/molecules/Detail/PopulationCard/ResidentPopulationCard";
import FloatingPopulationInfoModal from "@/components/molecules/Detail/PopulationCard/InfoModal/FloatingPopulationInfoModal";

type Props = { 
  trdarCode: string | null;
  populationType: "유동" | "직장" | "상주";
  onPopulationTypeChange: (type: "유동" | "직장" | "상주") => void;
};

type DetailResponse = {
  quarter: string;
  trdarCd: string;
  trdarNm: string;
  slots: { key: string; label: string; value: number }[];
  max: { index: number; label: string; value: number };
  // Weekday fields are optional – API may include them
  days?: { key: string; label: string; value: number }[];
  dayMax?: { index: number; label: string; value: number };
  dayMin?: { index: number; label: string; value: number };
};

type FlpopApiResponse = {
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
    stdrYyquCd: number;
    trdarSeCd: string;
    trdarSeCdNm: string;
    trdarCd: number;
    trdarCdNm: string;
    totFlpopCo: number;
    mlFlpopCo: number;
    fmlFlpopCo: number;
    agrde10FlpopCo: number;
    agrde20FlpopCo: number;
    agrde30FlpopCo: number;
    agrde40FlpopCo: number;
    agrde50FlpopCo: number;
    agrde60AboveFlpopCo: number;
    tmzon0006FlpopCo: number;
    tmzon0611FlpopCo: number;
    tmzon1114FlpopCo: number;
    tmzon1417FlpopCo: number;
    tmzon1721FlpopCo: number;
    tmzon2124FlpopCo: number;
    monFlpopCo: number;
    tuesFlpopCo: number;
    wedFlpopCo: number;
    thurFlpopCo: number;
    friFlpopCo: number;
    satFlpopCo: number;
    sunFlpopCo: number;
  };
};

export default function TimeSlotCard({ trdarCode, populationType, onPopulationTypeChange }: Props) {
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"time" | "dow">("time");
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
        // 새로운 유동인구 API 호출
        console.log("🔍 유동인구 API 호출 시작:", trdarCode);
        const dRes = await fetch(`/api/v1/data/info/flpop?trdarCd=${trdarCode}`, { cache: "no-store" });
        if (!dRes.ok) throw new Error("flpop API failed");
        const apiResponse = (await dRes.json()) as FlpopApiResponse;
        console.log("🔍 유동인구 API 응답:", apiResponse);
        if (aborted) return;

        if (!apiResponse.isSuccess) {
          throw new Error(apiResponse.message || "API request failed");
        }

        // API 응답을 DetailResponse 형식으로 변환
        const result = apiResponse.result;
        const d: DetailResponse = {
          quarter: result.stdrYyquCd.toString(),
          trdarCd: result.trdarCd.toString(),
          trdarNm: result.trdarCdNm,
          slots: [
            { key: "tmzon0006", label: "00-06시", value: result.tmzon0006FlpopCo },
            { key: "tmzon0611", label: "06-11시", value: result.tmzon0611FlpopCo },
            { key: "tmzon1114", label: "11-14시", value: result.tmzon1114FlpopCo },
            { key: "tmzon1417", label: "14-17시", value: result.tmzon1417FlpopCo },
            { key: "tmzon1721", label: "17-21시", value: result.tmzon1721FlpopCo },
            { key: "tmzon2124", label: "21-24시", value: result.tmzon2124FlpopCo },
          ],
          days: [
            { key: "mon", label: "월요일", value: result.monFlpopCo },
            { key: "tues", label: "화요일", value: result.tuesFlpopCo },
            { key: "wed", label: "수요일", value: result.wedFlpopCo },
            { key: "thur", label: "목요일", value: result.thurFlpopCo },
            { key: "fri", label: "금요일", value: result.friFlpopCo },
            { key: "sat", label: "토요일", value: result.satFlpopCo },
            { key: "sun", label: "일요일", value: result.sunFlpopCo },
          ],
          max: { index: 0, label: "", value: 0 },
          dayMax: { index: 0, label: "", value: 0 },
          dayMin: { index: 0, label: "", value: 0 },
        };

        // 시간대별 최대값 찾기
        let maxIndex = 0;
        let maxValue = d.slots[0].value;
        d.slots.forEach((slot, index) => {
          if (slot.value > maxValue) {
            maxValue = slot.value;
            maxIndex = index;
          }
        });
        d.max = { index: maxIndex, label: d.slots[maxIndex].label, value: maxValue };

        // 요일별 최대/최소값 찾기
        if (d.days) {
          let dayMaxIndex = 0;
          let dayMaxValue = d.days[0].value;
          let dayMinIndex = 0;
          let dayMinValue = d.days[0].value;
          
          d.days.forEach((day, index) => {
            if (day.value > dayMaxValue) {
              dayMaxValue = day.value;
              dayMaxIndex = index;
            }
            if (day.value < dayMinValue) {
              dayMinValue = day.value;
              dayMinIndex = index;
            }
          });
          
          d.dayMax = { index: dayMaxIndex, label: d.days[dayMaxIndex].label, value: dayMaxValue };
          d.dayMin = { index: dayMinIndex, label: d.days[dayMinIndex].label, value: dayMinValue };
        }

        console.log("🔍 변환된 데이터:", d);
        setData(d);
      } catch (e: unknown) {
        if (!aborted) setError(e instanceof Error ? e.message : "load failed");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();
    return () => {
      aborted = true;
    };
  }, [trdarCode]);

  const labels = useMemo(() => data?.slots.map((s) => s.label) ?? [], [data]);
  const values = useMemo(() => data?.slots.map((s) => s.value) ?? [], [data]);
  const maxIndex = data?.max.index ?? null;
  const timeMax = data?.max ?? null;
  const timeMin = useMemo(() => {
    if (!data?.slots || data.slots.length === 0) return null;
    let bestIdx = 0;
    for (let i = 1; i < data.slots.length; i++) {
      if (data.slots[i].value < data.slots[bestIdx].value) bestIdx = i;
    }
    const slot = data.slots[bestIdx];
    return { index: bestIdx, label: slot.label, value: slot.value };
  }, [data]);

  const dayLabels = useMemo(() => data?.days?.map((d) => d.label) ?? [], [data]);
  const dayValues = useMemo(() => data?.days?.map((d) => d.value) ?? [], [data]);
  const dayMaxIndex = data?.dayMax?.index ?? null;

  // 토글 상태에 따라 다른 카드 렌더링
  if (populationType === "직장") {
    return <WorkPopulationCard trdarCode={trdarCode} populationType={populationType} onPopulationTypeChange={onPopulationTypeChange} />;
  }
  
  if (populationType === "상주") {
    return <ResidentPopulationCard trdarCode={trdarCode} populationType={populationType} onPopulationTypeChange={onPopulationTypeChange} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[18px] font-semibold text-gray-900">유동인구</h3>
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
            aria-label="유동인구 정보"
          >
            <span className="text-xs font-bold">i</span>
          </button>
          {data?.quarter && (
            <span className="text-xs text-gray-400">
              {data.quarter.slice(0, 4)}년도 {data.quarter.slice(4)}분기 기준
            </span>
          )}
        </div>
        <PopulationToggle
          selected={populationType}
          onChange={onPopulationTypeChange}
        />
      </div>

      {/* Segmented control: 시간대별 / 요일별 */}
      <div className="mt-4 w-full rounded-xl bg-gray-100 p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setMode("time")}
            aria-pressed={mode === "time"}
            className={
              `cursor-pointer w-full justify-center rounded-xl px-4 py-4 text-sm font-medium ` +
              (mode === "time" ? "bg-white text-[#3288FF] shadow-sm" : "text-gray-500")
            }
          >
            시간대별 추이
          </button>
          <button
            type="button"
            onClick={() => setMode("dow")}
            aria-pressed={mode === "dow"}
            className={
              `cursor-pointer w-full justify-center rounded-xl px-4 py-4 text-sm font-medium ` +
              (mode === "dow" ? "bg-white text-[#3288FF] shadow-sm" : "text-gray-500")
            }
          >
            요일별 추이
          </button>
        </div>
      </div>

      {/* Highlight */}
      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-4 text-gray-900 text-center">
        {trdarCode == null ? (
          <span className="text-gray-500">상권을 선택하면 시간대별 유동인구를 보여드려요.</span>
        ) : loading ? (
          <span className="text-gray-500">불러오는 중…</span>
        ) : error ? (
          <span className="text-rose-600">데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</span>
        ) : data ? (
          <>
            {mode === "time" ? (
              <>
                <span className="font-medium">유동인구가 가장 많은 시간대는</span>
                <span className="ml-1 font-bold" style={{ color: '#3288FF' }}>{data.max.label}</span>
                <span className="ml-1 font-medium">입니다.</span>
              </>
            ) : (
              <>
                <span className="font-medium">유동인구가 가장 많은 요일은</span>
                <span className="ml-1 font-bold" style={{ color: '#3288FF' }}>{data.dayMax?.label ?? "알 수 없음"}</span>
                <span className="ml-1 font-medium">입니다.</span>
              </>
            )}
          </>
        ) : (
          <span className="text-gray-500">데이터가 없습니다.</span>
        )}
      </div>

      {/* 선택 모드별 최다/최소 표 (Highlight와 Chart 사이) */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
        <div className="grid grid-cols-2">
          <div className="bg-[#3288FF1A] px-4 py-3 text-center text-sm font-semibold text-black">
            {mode === "time" ? "유동인구가 가장 많은 시간대" : "유동인구가 가장 많은 요일"}
          </div>
          <div className="border-l border-gray-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-black">
            {mode === "time" ? "유동인구가 가장 적은 시간대" : "유동인구가 가장 적은 요일"}
          </div>
          <div className="px-4 py-5 text-center text-black">
            {mode === "time" ? (
              timeMax ? (
                <>
                  <span className="font-semibold">{timeMax.label}</span>
                  {typeof timeMax.value === "number" && (
                    <span className="ml-2 text-gray-500 text-xs">{timeMax.value.toLocaleString()}명</span>
                  )}
                </>
              ) : (
                <span className="text-gray-500">데이터 없음</span>
              )
            ) : data?.dayMax ? (
              <>
                <span className="font-semibold">{data.dayMax.label}</span>
                {typeof data.dayMax.value === "number" && (
                  <span className="ml-2 text-gray-500 text-xs">{data.dayMax.value.toLocaleString()}명</span>
                )}
              </>
            ) : (
              <span className="text-gray-500">데이터 없음</span>
            )}
          </div>
          <div className="border-l border-gray-200 px-4 py-5 text-center text-black">
            {mode === "time" ? (
              timeMin ? (
                <>
                  <span className="font-semibold">{timeMin.label}</span>
                  {typeof timeMin.value === "number" && (
                    <span className="ml-2 text-gray-500 text-xs">{timeMin.value.toLocaleString()}명</span>
                  )}
                </>
              ) : (
                <span className="text-gray-500">데이터 없음</span>
              )
            ) : data?.dayMin ? (
              <>
                <span className="font-semibold">{data.dayMin.label}</span>
                {typeof data.dayMin.value === "number" && (
                  <span className="ml-2 text-gray-500 text-xs">{data.dayMin.value.toLocaleString()}명</span>
                )}
              </>
            ) : (
              <span className="text-gray-500">데이터 없음</span>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      {mode === "time" ? (
        <div className="mt-4 rounded-2xl border border-gray-200 p-3 overflow-x-auto">
          {data && labels.length === 6 ? (
            <FloatingPopulationTimeChart labels={labels} values={values} maxIndex={maxIndex} />
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">차트를 표시할 데이터가 없습니다.</div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-gray-200 p-3 overflow-x-auto">
          {data && dayLabels.length === 7 && dayValues.some((v) => Number.isFinite(v) && v > 0) ? (
            <FloatingPopulationWeekChart labels={dayLabels} values={dayValues} maxIndex={dayMaxIndex} />
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">차트를 표시할 데이터가 없습니다.</div>
          )}
        </div>
      )}

      {/* Info Modal */}
      <FloatingPopulationInfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)}
        position={modalPosition}
      />
    </div>
  );
}
