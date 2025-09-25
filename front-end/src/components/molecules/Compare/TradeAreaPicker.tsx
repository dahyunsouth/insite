"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SignGuRawData from "@/data/SignGuValue.json";
import AdstrdRawData from "@/data/AdstrdValue.json";
import TradeAreaRawData from "@/data/TradeAreaValue.json";
import { fetchGuList, fetchDongList, fetchTradeAreas, fetchTradeAreasDetail } from "@/lib/api/tradeAreas";

interface SignGuFileShape {
  DESCRIPTION: Record<string, unknown>;
  DATA: Array<{
    signgu_cd: string;
    signgu_nm: string;
  }>;
}

interface AdstrdFileShape {
  DESCRIPTION: Record<string, unknown>;
  DATA: Array<{
    adstrd_cd: string;
    adstrd_nm: string;
  }>;
}

interface TradeAreaFileShape {
  DESCRIPTION: Record<string, unknown>;
  DATA: Array<{
    trdar_cd: string;
    trdar_cd_nm: string;
    trdar_se_cd: string;
    trdar_se_cd_nm: string;
    signgu_cd: string;
    signgu_cd_nm: string;
    adstrd_cd: string;
    adstrd_cd_nm: string;
  }>;
}

interface Option {
  code: string;
  name: string;
}

interface TradeAreaOption extends Option {
  signguCode: string;
  signguName: string;
  adstrdCode: string;
  adstrdName: string;
  typeCode: string;
  typeName: string;
}

export interface TradeAreaSelection {
  signguCode?: string | null;
  adstrdCode?: string | null;
  tradeAreaCode?: string | null;
}

export type TradeAreaPickerProps = {
  title: string;
  value: TradeAreaSelection;
  onChange: (selection: TradeAreaSelection) => void;
  accentColor?: string;
  backgroundColor?: string;
};

const SIGNGU_OPTIONS: Option[] = (() => {
  const json = SignGuRawData as unknown as SignGuFileShape;
  const unique = new Map<string, string>();
  json.DATA.forEach((item) => {
    unique.set(item.signgu_cd, item.signgu_nm);
  });
  return Array.from(unique.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
})();

const ADSTRD_OPTIONS: Array<Option & { signguCode: string }> = (() => {
  const json = AdstrdRawData as unknown as AdstrdFileShape;
  return json.DATA.map((item) => ({
    code: item.adstrd_cd,
    name: item.adstrd_nm,
    signguCode: item.adstrd_cd.slice(0, 5),
  })).sort((a, b) => a.name.localeCompare(b.name, "ko"));
})();

const TRADE_AREA_OPTIONS: TradeAreaOption[] = (() => {
  const json = TradeAreaRawData as unknown as TradeAreaFileShape;
  return json.DATA.map((item) => ({
    code: item.trdar_cd,
    name: item.trdar_cd_nm,
    signguCode: item.signgu_cd,
    signguName: item.signgu_cd_nm,
    adstrdCode: item.adstrd_cd,
    adstrdName: item.adstrd_cd_nm,
    typeCode: item.trdar_se_cd,
    typeName: item.trdar_se_cd_nm,
  })).sort((a, b) => a.name.localeCompare(b.name, "ko"));
})();

const SIGNGU_NAME_BY_CODE = new Map(SIGNGU_OPTIONS.map((item) => [item.code, item.name]));
const ADSTRD_NAME_BY_CODE = new Map(ADSTRD_OPTIONS.map((item) => [item.code, item.name]));
const TRADE_AREA_BY_CODE = new Map(TRADE_AREA_OPTIONS.map((item) => [item.code, item]));

// TradeAreaRawData에서 상권 코드로 자치구/행정동 정보를 매핑하는 Map 생성
const TRADE_AREA_INFO_BY_CODE = (() => {
  const json = TradeAreaRawData as unknown as TradeAreaFileShape;
  return new Map(json.DATA.map((item) => [
    item.trdar_cd,
    {
      signguCode: item.signgu_cd,
      signguName: item.signgu_cd_nm,
      adstrdCode: item.adstrd_cd,
      adstrdName: item.adstrd_cd_nm,
    }
  ]));
})();

const normalize = (input: string) => input.trim().toLocaleLowerCase("ko-KR");

type Step = 1 | 2 | 3 | 4;

type PickerOption = {
  code: string;
  name: string;
  description?: string;
};

export default function TradeAreaPicker({ title, value, onChange, accentColor, backgroundColor }: TradeAreaPickerProps) {
  const hasSelection = Boolean(value.signguCode || value.adstrdCode || value.tradeAreaCode);

  const step: Step = useMemo(() => {
    if (!value.signguCode) return 1;
    if (!value.adstrdCode) return 2;
    if (!value.tradeAreaCode) return 3;
    return 4;
  }, [value.adstrdCode, value.signguCode, value.tradeAreaCode]);

  const [query, setQuery] = useState("");
  const inputWrapperRef = useRef<HTMLDivElement | null>(null);
  const dropdownContainerRef = useRef<HTMLDivElement | null>(null);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // 동적 구 목록 상태
  const [guList, setGuList] = useState<string[]>([]);
  const [loadingGuList, setLoadingGuList] = useState(false);
  const [guListError, setGuListError] = useState<string | null>(null);
  
  // 동적 동 목록 상태
  const [dongList, setDongList] = useState<string[]>([]);
  const [loadingDongList, setLoadingDongList] = useState(false);
  const [dongListError, setDongListError] = useState<string | null>(null);
  
  // 동적 상권 목록 상태
  const [tradeAreaList, setTradeAreaList] = useState<Array<{code: string, name: string, typeName: string}>>([]);
  const [loadingTradeAreaList, setLoadingTradeAreaList] = useState(false);
  const [tradeAreaListError, setTradeAreaListError] = useState<string | null>(null);


  const cardStyle = useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties = {};
    if (accentColor) style.borderColor = accentColor;
    if (backgroundColor) style.backgroundColor = backgroundColor;
    return style;
  }, [accentColor, backgroundColor]);


  useEffect(() => {
    setMounted(true);
  }, []);
  // 구 목록 로드
  useEffect(() => {
    const loadGuList = async () => {
      setLoadingGuList(true);
      console.log("구 목록 로드 시작...");
      setGuListError(null);
      try {
        const data = await fetchGuList();
        console.log("구 목록 API 응답:", data);
        setGuList(data);
      } catch (err) {
        setGuListError(err instanceof Error ? err.message : "구 목록을 불러올 수 없습니다.");
        setGuList([]);
      } finally {
        setLoadingGuList(false);
      }
    };
    loadGuList();
  }, []);

  // 동 목록 로드 (구가 선택되었을 때)
  useEffect(() => {
    if (!value.signguCode) {
      setDongList([]);
      return;
    }

    const loadDongList = async () => {
      setLoadingDongList(true);
      setDongListError(null);
      try {
        const data = await fetchDongList(value.signguCode!);
        console.log("동 목록 API 응답:", data);
        setDongList(data);
      } catch (err) {
        setDongListError(err instanceof Error ? err.message : "동 목록을 불러올 수 없습니다.");
        setDongList([]);
      } finally {
        setLoadingDongList(false);
      }
    };
    loadDongList();
  }, [value.signguCode]);

  // 상권 목록 로드 (구와 동이 모두 선택되었을 때)
  useEffect(() => {
    if (!value.signguCode || !value.adstrdCode) {
      setTradeAreaList([]);
      return;
    }

    const loadTradeAreaList = async () => {
      setLoadingTradeAreaList(true);
      setTradeAreaListError(null);
      try {
        const data = await fetchTradeAreasDetail(value.signguCode!, value.adstrdCode!);
        console.log("상권 목록 API 응답:", data);
        // areas 배열에서 trdarSeCdNm을 사용하여 목록 생성
        const areas = data.areas.map(area => ({
          code: area.trdarCd.toString(),
          name: area.trdarCdNm,
          typeName: area.trdarSeCdNm
        }));
        setTradeAreaList(areas);
      } catch (err) {
        setTradeAreaListError(err instanceof Error ? err.message : "상권 목록을 불러올 수 없습니다.");
        setTradeAreaList([]);
      } finally {
        setLoadingTradeAreaList(false);
      }
    };
    loadTradeAreaList();
  }, [value.signguCode, value.adstrdCode]);

  useEffect(() => {
    setQuery("");
    setIsOpen(false);
  }, [step]);

  // 자치구/행정동 이름을 TradeAreaRawData에서 직접 가져오기
  const selectedSignguName = value.signguCode ? 
    (value.tradeAreaCode ? TRADE_AREA_INFO_BY_CODE.get(value.tradeAreaCode)?.signguName : guList.find(gu => gu === value.signguCode)) : 
    undefined;
  const selectedAdstrdName = value.adstrdCode ? 
    (value.tradeAreaCode ? TRADE_AREA_INFO_BY_CODE.get(value.tradeAreaCode)?.adstrdName : dongList.find(dong => dong === value.adstrdCode)) : 
    undefined;
  const selectedTradeArea = value.tradeAreaCode ? TRADE_AREA_BY_CODE.get(value.tradeAreaCode) : undefined;
  const selectedTradeAreaDisplay = selectedTradeArea
    ? selectedTradeArea.name.endsWith("상권")
      ? selectedTradeArea.name.replace(" 상권", "").replace("상권", "")
      : selectedTradeArea.name
    : undefined;

  const summary = useMemo(() => {
    if (!selectedSignguName && !selectedAdstrdName && !selectedTradeAreaDisplay) {
      return "아직 선택된 상권이 없습니다.";
    }
    const parts: string[] = [];
    if (selectedSignguName) parts.push(selectedSignguName);
    if (selectedAdstrdName) parts.push(selectedAdstrdName);
    // 상권까지 선택되어도 summary에는 구 > 동까지만 표시
    return parts.join(" > ") || "아직 선택된 상권이 없습니다.";
  }, [selectedAdstrdName, selectedSignguName]);

  const currentOptions: PickerOption[] = useMemo(() => {
    const keyword = normalize(query);

    if (step === 1) {
      // API에서 가져온 구 목록 사용
      if (loadingGuList) return []; // 로딩 중일 때는 빈 배열
      console.log("Step 1 - guList:", guList, "options:", guList.map(name => ({ code: name, name })));
      const options = guList.map((name) => ({ code: name, name }));
      const filtered = keyword
        ? options.filter((item) => normalize(item.name).includes(keyword))
        : options;
      return filtered.slice(0, 8);
    }

    if (step === 2 && value.signguCode) {
      if (loadingDongList) return []; // 로딩 중일 때는 빈 배열
      // API에서 가져온 동 목록 사용
      console.log("Step 2 - dongList:", dongList); // Debug log
      const options = dongList.map((name) => ({ code: name, name }));
      const filtered = keyword
        ? options.filter((item) => normalize(item.name).includes(keyword))
        : options;
      return filtered.slice(0, 8);
    }

    if (step === 3 && value.signguCode && value.adstrdCode) {
      if (loadingTradeAreaList) return []; // 로딩 중일 때는 빈 배열
      // API에서 가져온 상권 목록 사용
      console.log("Step 3 - tradeAreaList:", tradeAreaList); // Debug log
      const filtered = keyword
        ? tradeAreaList.filter((item) => normalize(`${item.name} ${item.typeName}`).includes(keyword))
        : tradeAreaList;
      return filtered.slice(0, 8).map((item) => ({
        code: item.code,
        name: item.name,
        description: item.typeName,
      }));
    }

    return [];
  }, [query, step, value.adstrdCode, value.signguCode, guList, loadingGuList, dongList, loadingDongList, tradeAreaList, loadingTradeAreaList]);

  const emptyStateText = (() => {
    switch (step) {
      case 1:
        return loadingGuList ? "구 목록을 불러오는 중..." : "해당하는 구가 없습니다.";
      case 2:
        return loadingDongList ? "동 목록을 불러오는 중..." : "해당하는 동이 없습니다.";
      case 3:
        return loadingTradeAreaList ? "상권 목록을 불러오는 중..." : "해당하는 상권이 없습니다.";
      default:
        return "해당하는 상권이 없습니다.";
    }
  })();

  useEffect(() => {
    if (!mounted || !isOpen || step === 4) {
      setDropdownRect(null);
      return;
    }

    const updatePosition = () => {
      if (!inputWrapperRef.current) return;
      const rect = inputWrapperRef.current.getBoundingClientRect();
      setDropdownRect({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, mounted, step, value.signguCode, value.adstrdCode, value.tradeAreaCode, currentOptions.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (inputWrapperRef.current && inputWrapperRef.current.contains(target)) return;
      if (dropdownContainerRef.current && dropdownContainerRef.current.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  const shouldShowDropdown = mounted && isOpen && step !== 4 && dropdownRect !== null;

  const dropdownContent =
    shouldShowDropdown && dropdownRect
      ? createPortal(
          (
            <div
              ref={dropdownContainerRef}
              className="z-[400] max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
              style={{
                position: "absolute",
                top: dropdownRect.top,
                left: dropdownRect.left,
                width: dropdownRect.width,
              }}
            >
              {currentOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">{emptyStateText}</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {currentOptions.map((option) => (
                    <li key={option.code}>
                      <button
                        type="button"
                        className="flex w-full flex-col px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-100"
                        onClick={() => {
                          handleSelect(option);
                          setIsOpen(false);
                        }}
                      >
                        <span className="text-sm font-medium text-gray-900">{option.name}</span>
                        {option.description && (
                          <span className="mt-0.5 text-xs text-gray-500">{option.description}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ),
          document.body,
        )
      : null;

  const handleSignguChange = (code: string) => {
    onChange({
      signguCode: code || null,
      adstrdCode: null,
      tradeAreaCode: null,
    });
  };

  const handleAdstrdChange = (code: string) => {
    onChange({
      signguCode: value.signguCode ?? null,
      adstrdCode: code || null,
      tradeAreaCode: null,
    });
  };

  const handleTradeAreaChange = (code: string) => {
    onChange({
      signguCode: value.signguCode ?? null,
      adstrdCode: value.adstrdCode ?? null,
      tradeAreaCode: code || null,
    });
  };

  const handleSelect = (option: PickerOption) => {
    if (step === 1) {
      handleSignguChange(option.code);
    } else if (step === 2) {
      handleAdstrdChange(option.code);
    } else if (step === 3) {
      handleTradeAreaChange(option.code);
    }
  };

  const handleReset = () => {
    setQuery("");
    setIsOpen(false);
    onChange({ signguCode: null, adstrdCode: null, tradeAreaCode: null });
  };

  const stepTitle = (() => {
    switch (step) {
      case 1:
        return "1단계. 자치구 검색";
      case 2:
        return "2단계. 행정동 검색";
      case 3:
        return "3단계. 상권 검색";
      default:
        return null;
    }
  })();

  const placeholder = (() => {
    switch (step) {
      case 1:
        return "구를 검색해주세요";
      case 2:
        return "동을 검색해주세요";
      case 3:
        return "상권을 검색해주세요";
      default:
        return "";
    }
  })();


  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" style={cardStyle}>
        <div className="flex items-start justify-between gap-4 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold text-gray-900 truncate" title={selectedTradeAreaDisplay ? `📍${selectedTradeAreaDisplay}` : title}>
              {selectedTradeAreaDisplay ? `📍${selectedTradeAreaDisplay}` : title}
            </div>
            <div className="mt-1 text-sm text-gray-600 truncate" title={summary}>{summary}</div>
          </div>
          {hasSelection && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 flex-shrink-0 whitespace-nowrap"
            >
              다시 선택하기
            </button>
          )}
        </div>

        {step !== 4 ? (
          <div className="mt-4">
            {stepTitle && <div className="text-xs font-semibold text-gray-500">{stepTitle}</div>}
            <div className="relative mt-2" ref={inputWrapperRef}>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                aria-label={placeholder}
                onFocus={() => setIsOpen(true)}
                onClick={() => setIsOpen(true)}
              />
            </div>
          </div>
        ) : null}
      </div>
      {dropdownContent}
    </>
  );
}
