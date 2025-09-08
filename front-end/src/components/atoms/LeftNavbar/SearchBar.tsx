"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type SearchBarProps = {
  onSearch?: (query: string) => void;
};

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [enterActive, setEnterActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node | null;
      if (target && !containerRef.current.contains(target)) {
        // 바깥 클릭 시 포커스 해제 및 입력 값 초기화 → placeholder 노출
        setQuery("");
        inputRef.current?.blur();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (onSearch) onSearch(trimmed);
  };

  return (
    <div ref={containerRef} className="flex items-center w-full sm:w-64 md:w-72 lg:w-80 xl:w-96 2xl:w-[28rem] max-w-full">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEnterActive(true);
            handleSearch();
            setTimeout(() => setEnterActive(false), 250);
          }
        }}
        placeholder="지하철명, 자치구명으로 검색"
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


