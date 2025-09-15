import React, { useEffect, useMemo, useRef, useState } from "react";

type RankItem = {
  rank: number;
  name: string;
  viewers: number;
};

type LiveRankProps = {
  className?: string;
  intervalMs?: number; // time per item
};

const HARD_CODED_RANKS: RankItem[] = [
  { rank: 1, name: "강남역", viewers: 15432 },
  { rank: 2, name: "홍대입구", viewers: 13210 },
  { rank: 3, name: "잠실 롯데월드몰", viewers: 12845 },
  { rank: 4, name: "사당역", viewers: 11234 },
  { rank: 5, name: "건대 커먼그라운드", viewers: 10120 },
  { rank: 6, name: "성수 카페거리", viewers: 9860 },
  { rank: 7, name: "여의도 IFC몰", viewers: 9132 },
  { rank: 8, name: "광화문 광장", viewers: 8741 },
  { rank: 9, name: "부산 서면", viewers: 8320 },
];

export default function LiveRank({ className, intervalMs = 2000 }: LiveRankProps) {
  const items = useMemo(() => HARD_CODED_RANKS, []);
  // [lastClone, ...items, firstClone]
  const extended = useMemo(() => {
    const first = items[0];
    const last = items[items.length - 1];
    return [last, ...items, first];
  }, [items]);

  // start at 1 (first real item)
  const [index, setIndex] = useState(1);
  const [enableTransition, setEnableTransition] = useState(true);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rowHeight, setRowHeight] = useState(0);
  const currentIndexRef = useRef(1);

  // Measure one-row viewport height to move by exact pixels instead of percentages
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setRowHeight(containerRef.current.clientHeight);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  // keep a ref with the latest index to avoid stale closures in transitionEnd
  useEffect(() => {
    currentIndexRef.current = index;
  }, [index]);

  // When we step onto the last clone (index === items.length + 1), snap back to first real (index = 1)
  const handleTransitionEnd: React.TransitionEventHandler<HTMLDivElement> = (e) => {
    if (e.target !== trackRef.current) return; // ignore bubbled events
    if (e.propertyName !== "transform") return; // only react to transform
    if (currentIndexRef.current === items.length + 1) {
      // Hard snap without any visible animation:
      // 1) disable transition
      setEnableTransition(false);
      // 2) next frame: move to first real item
      requestAnimationFrame(() => {
        setIndex(1);
        currentIndexRef.current = 1;
        // force reflow to ensure the browser applies the transform without transition
        if (trackRef.current) {
          void (trackRef.current as HTMLDivElement).offsetHeight;
        }
        // 3) following frame: re-enable transition for subsequent moves
        requestAnimationFrame(() => setEnableTransition(true));
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={
        "overflow-hidden w-full " +
        // One-row viewport height, responsive with clamp
        "h-[clamp(32px,3.2vw,44px)] " +
        (className ?? "")
      }
    >
      <div
        ref={trackRef}
        onTransitionEnd={handleTransitionEnd}
        className={"flex flex-col"}
        style={{
          transform: `translateY(-${index * rowHeight}px)`,
          transition: enableTransition ? "transform 500ms ease-out" : "none",
        }}
      >
        {extended.map((item, i) => (
          <Row key={`rank-${i}-${item.rank}`} item={item} />
        ))}
      </div>
    </div>
  );
}

function Row({ item }: { item: RankItem }) {
  return (
    <div className="h-[clamp(32px,3.2vw,44px)] flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <span className="font-bold text-[#3288FF] text-[clamp(13px,1.2vw,15px)] leading-none">
          {item.rank}
        </span>
        <span className="text-black font-normal text-[clamp(13px,1.2vw,15px)] leading-none">
          {item.name}
        </span>
      </div>
      <div>
        <span className="text-gray-500 font-normal text-[clamp(12px,1.1vw,14px)] leading-none">
          {item.viewers.toLocaleString()}명
        </span>
      </div>
    </div>
  );
}


