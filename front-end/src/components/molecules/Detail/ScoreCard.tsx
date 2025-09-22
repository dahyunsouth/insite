"use client";

import React, { useEffect, useState } from "react";

type Props = { trdarCode: string | null };

type ScoreResponse = {
  quarter: string;
  trdarCd: string;
  trdarNm: string;
  totalScore: number;
  salesScore: number;
  footTrafficScore: number;
  competitionScore: number;
  infrastructureScore: number;
  recommendation: string;
};

export default function ScoreCard({ trdarCode }: Props) {
  const [data, setData] = useState<ScoreResponse | null>(null);
  const [quarter, setQuarter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const qRes = await fetch("/api/seoul/latest-quarter", { cache: "no-store" });
        if (!qRes.ok) throw new Error("latest-quarter failed");
        const q = (await qRes.json()).quarter as string;
        if (aborted) return;
        setQuarter(q);

        // TODO: 실제 API 엔드포인트로 변경 필요
        // 현재는 더미 데이터 사용
        const dummyData: ScoreResponse = {
          quarter: q,
          trdarCd: trdarCode,
          trdarNm: "상권명",
          totalScore: 78,
          salesScore: 85,
          footTrafficScore: 72,
          competitionScore: 68,
          infrastructureScore: 88,
          recommendation: "추천"
        };
        
        if (aborted) return;
        setData(dummyData);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-rose-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-emerald-50";
    if (score >= 60) return "bg-yellow-50";
    return "bg-rose-50";
  };

  return (
    <div>
      <h3 className="text-[18px] font-semibold text-gray-900">종합추천점수</h3>

      {/* Caption */}
      <div className="mt-1 text-right text-xs text-gray-400">{quarter ?? "—"}</div>

      {/* Main Score */}
      {data && (
        <div className={`mt-4 rounded-2xl border border-gray-200 p-6 text-center ${getScoreBackground(data.totalScore)}`}>
          <div className="text-sm font-semibold text-gray-700">종합 점수</div>
          <div className={`mt-2 text-4xl font-bold ${getScoreColor(data.totalScore)}`}>
            {data.totalScore}
          </div>
          <div className="text-sm text-gray-600 mt-1">/ 100점</div>
          <div className="mt-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              data.recommendation === "추천" 
                ? "bg-emerald-100 text-emerald-800" 
                : data.recommendation === "보통"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-rose-100 text-rose-800"
            }`}>
              {data.recommendation}
            </span>
          </div>
        </div>
      )}

      {/* Detailed Scores */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ScoreTile
          title="매출 점수"
          score={data?.salesScore ?? 0}
          showScore={!!data}
        />
        <ScoreTile
          title="유동인구 점수"
          score={data?.footTrafficScore ?? 0}
          showScore={!!data}
        />
        <ScoreTile
          title="경쟁 환경 점수"
          score={data?.competitionScore ?? 0}
          showScore={!!data}
        />
        <ScoreTile
          title="인프라 점수"
          score={data?.infrastructureScore ?? 0}
          showScore={!!data}
        />
      </div>

      {/* Empty/Loading/Error */}
      {trdarCode == null ? (
        <div className="mt-3 text-sm text-gray-500">상권을 선택하면 종합추천점수를 보여드려요.</div>
      ) : loading ? (
        <div className="mt-3 text-sm text-gray-500">불러오는 중…</div>
      ) : error ? (
        <div className="mt-3 text-sm text-rose-600">데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</div>
      ) : null}
    </div>
  );
}

function ScoreTile({ title, score, showScore }: { title: string; score: number; showScore: boolean }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-rose-600";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-sm font-semibold text-gray-700">{title}</div>
      <div className={`mt-2 text-[22px] font-bold ${showScore ? getScoreColor(score) : "text-gray-400"}`}>
        {showScore ? score : "—"}
      </div>
      <div className="mt-1 text-xs text-gray-500">/ 100점</div>
    </div>
  );
}
