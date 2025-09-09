'use client';

import React from 'react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 상단 섹션 (1/3) */}
      <div className="flex-1 bg-gray-50">
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">상단 섹션 (1/3)</p>
        </div>
      </div>

      {/* 중간 섹션 (1/3) */}
      <div className="flex-1 bg-white">
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">중간 섹션 (1/3)</p>
        </div>
      </div>

      {/* 하단 섹션 (1/3) */}
      <div className="flex-1 bg-gray-100">
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">하단 섹션 (1/3)</p>
        </div>
      </div>
    </div>
  );
}
