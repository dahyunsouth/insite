"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Combobox } from "@headlessui/react";

type Option = { code: string; name: string };

type Props = {
  className?: string;
  onChange?: (opt: Option | null) => void;
};

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function TradeAreaSelect({ className, onChange }: Props) {
  const [quarter, setQuarter] = useState<string | null>(null);
  const [items, setItems] = useState<Map<string, Option>>(new Map());
  const [total, setTotal] = useState<number | null>(null);
  const [nextStart, setNextStart] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Option | null>(null);
  const [query, setQuery] = useState("");
  const dq = useDebounced(query, 200);

  const sortedItems = useMemo(() => {
    const arr = Array.from(items.values());
    if (!dq) return arr;
    const q = dq.trim().toLowerCase();
    const starts: Option[] = [];
    const contains: Option[] = [];
    for (const it of arr) {
      const name = it.name.toLowerCase();
      if (name.startsWith(q)) starts.push(it);
      else if (name.includes(q)) contains.push(it);
    }
    return [...starts, ...contains];
  }, [items, dq]);

  const loadQuarter = useCallback(async () => {
    const res = await fetch("/api/seoul/latest-quarter", { cache: "no-store" });
    if (!res.ok) throw new Error("failed latest-quarter");
    const data = (await res.json()) as { quarter: string };
    return data.quarter;
  }, []);

  const loadRange = useCallback(
    async (qtr: string, start: number, end: number) => {
      const url = `/api/seoul/trade-areas/options?quarter=${qtr}&start=${start}&end=${end}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("failed options");
      const data = (await res.json()) as {
        total: number;
        items: Option[];
        hasMore: boolean;
        range: { start: number; end: number };
      };
      setTotal(data.total);
      setHasMore(data.hasMore);
      setNextStart(data.range.end + 1);
      setItems((prev) => {
        const m = new Map(prev);
        for (const it of data.items) if (!m.has(it.code)) m.set(it.code, it);
        return m;
      });
    },
    []
  );

  const init = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = await loadQuarter();
      setQuarter(q);
      // Load only first 10 items once (no infinite scroll)
      await loadRange(q, 1, 10);
      setHasMore(false);
    } catch (e: any) {
      setError(e?.message ?? "load failed");
    } finally {
      setLoading(false);
    }
  }, [loadQuarter, loadRange]);

  useEffect(() => {
    init();
  }, [init]);

  const listRef = useRef<HTMLDivElement>(null);
  // Disable infinite scroll: keep a no-op handler
  const onScroll = useCallback(() => {}, []);

  useEffect(() => {
    // Debug log: selection propagated to parent
    // eslint-disable-next-line no-console
    console.log("[TradeAreaSelect] onChange selected:", selected);
    if (onChange) onChange(selected);
  }, [selected, onChange]);

  return (
    <div className={className}>
      <Combobox value={selected} onChange={setSelected} nullable>
        <div className="relative w-64">
          <Combobox.Input
            className="w-full rounded-xl border border-gray-300 bg-white/95 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3288FF]"
            displayValue={(opt: Option | null) => (opt ? `${opt.name} · ${opt.code}` : "")}
            placeholder={quarter ? "상권 검색" : "로딩 중..."}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Combobox.Options
            ref={listRef as any}
            className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
          >
              {error && (
                <div className="px-3 py-2 text-sm text-rose-600">{error}</div>
              )}
              {!error && sortedItems.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {loading ? "불러오는 중..." : dq ? "검색 결과가 없습니다" : "목록이 비어 있습니다"}
                </div>
              )}
              {sortedItems.map((opt) => (
                <Combobox.Option key={opt.code} value={opt}>
                  {({ active, selected }) => (
                    <div
                      className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm ${
                        active ? "bg-[#EAF3FF] text-[#0F55C5]" : "text-gray-700"
                      }`}
                    >
                      <span className={selected ? "font-semibold" : undefined}>{opt.name}</span>
                      <span className="ml-2 text-xs text-gray-400">{opt.code}</span>
                    </div>
                  )}
                </Combobox.Option>
              ))}
              {/* Infinite scroll disabled */}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
}
