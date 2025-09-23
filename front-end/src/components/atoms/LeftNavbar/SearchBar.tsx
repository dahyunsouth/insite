"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type SearchBarProps = {
  onSearch?: (query: string) => void;
  onSearchResultsShow?: (show: boolean, keyword: string) => void;
  resetTrigger?: number;
};

const SearchBar = ({ onSearch, onSearchResultsShow, resetTrigger }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [enterActive, setEnterActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // resetTrigger가 변경되면 검색창 초기화
  useEffect(() => {
    if (resetTrigger !== undefined) {
      setQuery("");
      if (onSearchResultsShow) {
        onSearchResultsShow(false, '');
      }
      inputRef.current?.blur();
    }
  }, [resetTrigger, onSearchResultsShow]);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node | null;
      if (target && !containerRef.current.contains(target)) {
        // 검색 결과 영역도 체크하여 검색 결과 클릭 시에는 닫히지 않도록 함
        const searchResultElement = document.querySelector('[data-search-results]');
        if (searchResultElement && searchResultElement.contains(target)) {
          return; // 검색 결과 영역 클릭 시에는 아무것도 하지 않음
        }
        
        // 지도 영역 클릭 시에도 검색 결과가 닫히지 않도록 함
        const mapElement = document.querySelector('#map');
        if (mapElement && mapElement.contains(target)) {
          return; // 지도 영역 클릭 시에는 아무것도 하지 않음
        }
        
        // 바깥 클릭 시 포커스 해제 및 입력 값 초기화 → placeholder 노출
        setQuery("");
        if (onSearchResultsShow) {
          onSearchResultsShow(false, '');
        }
        inputRef.current?.blur();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onSearchResultsShow]);

  const handleSearch = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      if (onSearchResultsShow) {
        onSearchResultsShow(false, '');
      }
      return;
    }
    
    if (onSearch) onSearch(trimmed);
    if (onSearchResultsShow) {
      onSearchResultsShow(true, trimmed);
    }
  }, [query, onSearch, onSearchResultsShow]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // 실시간 검색 결과 표시 제거 - 엔터키를 눌렀을 때만 검색 결과 표시
  }, []);

  return (
    <div ref={containerRef} className="relative px-4 py-1 flex items-center w-full sm:w-64 md:w-72 lg:w-80 xl:w-96 2xl:w-[28rem] max-w-full">
      <input
        ref={inputRef}
        value={query}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEnterActive(true);
            handleSearch();
            setTimeout(() => setEnterActive(false), 250);
          }
        }}
        onFocus={() => {
          // 포커스 시에도 실시간 검색 결과 표시하지 않음
        }}
        placeholder="지하철역, 자치구로 검색"
        aria-label="Search business area"
        className="flex-1 w-full min-w-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0 placeholder-gray-400 focus:placeholder-transparent text-black px-0 transition-all"
        type="text"
      />
      <button
        type="button"
        className={`ml-2 ${enterActive ? "text-[#3288FF]" : "text-gray-400"} hover:text-[#3288FF] hover:cursor-pointer`}
        aria-label="Search"
        onClick={handleSearch}
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>
      
    </div>
  );
};

export default SearchBar;


