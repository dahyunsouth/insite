"use client";

import React, { useEffect, useState } from "react";
import ScorePoligonChart from "./ScorePoligonChart";
import ScoreInfoSection from "./ScoreInfoSection";

type Props = { 
  trdarCode: string | null;
  trdarCdNm?: string; // 상권명 추가
};

type ScoreResponse = {
  district: string;
  dong: string;
  areaName: string;
  areaType: string;
  totalScore: number;
  sustainabilityScore: number;
  profitabilityScore: number;
  accessibilityScore: number;
  riskScore: number;
  competitionScore: number;
};

export default function ScoreCard({ trdarCode, trdarCdNm }: Props) {
  const [data, setData] = useState<ScoreResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAxis, setSelectedAxis] = useState<number>(0); // 선택된 축 인덱스

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (!trdarCode || !trdarCdNm) {
        setData(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // API 호출
        const response = await fetch(`/api/v1/data/score?trdarCdNm=${encodeURIComponent(trdarCdNm)}`, { 
          cache: "no-store" 
        });
        
        if (!response.ok) throw new Error("API 호출 실패");
        const apiData = await response.json();
        
        if (aborted) return;
        
        if (apiData.isSuccess && apiData.result) {
          setData(apiData.result);
        } else {
          throw new Error(apiData.message || "데이터를 불러올 수 없습니다.");
        }
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
  }, [trdarCode, trdarCdNm]);

  // 레이더 차트용 데이터 준비 (단일 상권) - 5개 항목
  const radarData = data ? {
    labels: ["지속성", "수익성", "접근성", "위험도", "경쟁강도"],
    series: [{
      name: data.areaName,
      values: [data.sustainabilityScore, data.profitabilityScore, data.accessibilityScore, data.riskScore, data.competitionScore],
      color: "#2563EB"
    }],
    maxValue: 100
  } : null;

  return (
    <div className="overflow-visible h-fit">
      <h3 className="text-[18px] font-semibold text-gray-900">종합 추천 점수</h3>

      {/* Content Layout */}
      <div className="mt-4 grid grid-cols-2 gap-4 overflow-visible h-fit">
        {/* Left: ScorePoligonChart */}
        <div className="h-80 w-full">
          {radarData ? (
            <ScorePoligonChart
              labels={radarData.labels}
              series={radarData.series}
              maxValue={radarData.maxValue}
              animate={true}
              duration={700}
              selectedAxis={selectedAxis}
              onSelectAxis={setSelectedAxis}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              데이터 없음
            </div>
          )}
        </div>

        {/* Right: ScoreInfoSection */}
        <div className="w-full h-fit">
          {/* 종합추천점수 표시 */}
          {data && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">종합추천점수</span>
                <span className="text-2xl font-bold text-blue-600">{data.totalScore}점</span>
              </div>
            </div>
          )}
          <ScoreInfoSection
            pc={(() => {
              const pcs = [
                {
                  id: 1,
                  code: "지속성",
                  name: "상권 생존 가능성",
                  features: ["운영_개월_평균", "폐업_개월_평균", "개업률"],
                  meaning: "상권의 생존력을 나타내는 지표입니다.",
                  highText: "운영 60개월 이상, 폐업 36개월 이상, 개업률 10% 이상의 매우 안정적인 상권",
                  lowText: "운영 12개월 미만, 폐업 6개월 미만, 개업률 1% 미만의 극도로 불안정한 상권"
                },
                {
                  id: 2,
                  code: "수익성",
                  name: "시장 잠재력",
                  features: ["시장_잠재력", "수요-공급_균형", "소득_수준", "집객시설", "예측_매출"],
                  meaning: "상권의 수익성과 시장 잠재력",
                  highText: "유사업종 50개 이상, 포화도 10% 이하, 유동인구 10만명/점포 이상, 소득 400만원 이상, 집객시설 50개 이상, 예측매출 1억원 이상의 높은 수익성 상권",
                  lowText: "유사업종 10개 미만, 포화도 50% 초과, 유동인구 2만명/점포 미만, 소득 200만원 미만, 집객시설 10개 미만, 예측매출 1천만원 미만의 낮은 수익성 상권"
                },
                {
                  id: 3,
                  code: "접근성",
                  name: "교통편의성",
                  features: ["지하철역_거리", "버스_정류장_거리"],
                  meaning: "상권의 교통 편의성을 나타냅니다.",
                  highText: "지하철역 200m 이내, 버스정류장 100m 이내의 교통편의성이 매우 좋은 상권",
                  lowText: "지하철역 3km 초과, 버스정류장 1km 초과의 교통편의성이 떨어지는 상권"
                },
                {
                  id: 4,
                  code: "위험도",
                  name: "사업 위험 요소 (벌점 방식)",
                  features: ["점포_수_대비_유동인구", "폐업_개월", "폐업률"],
                  meaning: "상권의 위험도를 나타냅니다.",
                  highText: "유동인구 10만명/점포 이상, 폐업 24개월 이상, 폐업률 2% 이하의 위험이 낮은 안정적 상권",
                  lowText: "유동인구 2만명/점포 미만, 폐업 6개월 미만, 폐업률 20% 초과의 위험이 높은 불안정 상권"
                },
                {
                  id: 5,
                  code: "경쟁강도",
                  name: "경쟁 상황",
                  features: ["점포_수", "수요_밀도", "점포_밀도"],
                  meaning: "상권의 경쟁 강도를 나타냅니다.",
                  highText: "점포 5개 이하, 유동인구 10만명 이상, 점포밀도 0.5개/100㎡ 이하의 경쟁이 약한 상권",
                  lowText: "점포 30개 초과, 유동인구 3만명 미만, 점포밀도 3.0개/100㎡ 초과의 경쟁이 치열한 상권"
                }
              ];
              return pcs[selectedAxis] || pcs[0];
            })()}
            score={data ? (() => {
              const scores = [
                data.sustainabilityScore,
                data.profitabilityScore,
                data.accessibilityScore,
                data.riskScore,
                data.competitionScore
              ];
              return scores[selectedAxis];
            })() : undefined}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Empty/Loading/Error */}
      {!trdarCode || !trdarCdNm ? (
        <div className="mt-3 text-sm text-gray-500">상권을 선택하면 종합추천점수를 보여드려요.</div>
      ) : loading ? (
        <div className="mt-3 text-sm text-gray-500">불러오는 중…</div>
      ) : error ? (
        <div className="mt-3 text-sm text-rose-600">데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</div>
      ) : null}
    </div>
  );
}
