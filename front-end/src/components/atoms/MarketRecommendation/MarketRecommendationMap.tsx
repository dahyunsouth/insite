'use client';

import React, { useState, useCallback, useEffect } from 'react';
import seoulDistrictsData from '@/data/seoulDistricts.json';

interface DistrictFeature {
  type: 'Feature';
  properties: {
    code: string;
    name: string;
    name_eng: string;
    base_year: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

interface SeoulDistrictsData {
  type: 'FeatureCollection';
  features: DistrictFeature[];
}

interface MarketRecommendationMapProps {
  onDistrictSelect?: (districtId: string | null, districtName: string) => void;
  onNextStep?: () => void;
  initialSelectedDistrict?: string | null;
}

export default function MarketRecommendationMap({ onDistrictSelect, onNextStep, initialSelectedDistrict }: MarketRecommendationMapProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(initialSelectedDistrict || null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [districts, setDistricts] = useState<SeoulDistrictsData | null>(null);

  useEffect(() => {
    setDistricts(seoulDistrictsData as SeoulDistrictsData);
  }, []);

  // initialSelectedDistrict가 변경될 때 selectedDistrict 상태 동기화
  useEffect(() => {
    setSelectedDistrict(initialSelectedDistrict || null);
  }, [initialSelectedDistrict]);

  const handleDistrictClick = useCallback((districtId: string, districtName: string) => {
    const isDeselecting = selectedDistrict === districtId;
    setSelectedDistrict(isDeselecting ? null : districtId);
    
    if (isDeselecting) {
      // 선택 해제 시 null을 전달하여 기본값으로 복원
      onDistrictSelect?.(null, '');
    } else {
      // 선택 시 해당 구 정보 전달
      onDistrictSelect?.(districtId, districtName);
    }
  }, [selectedDistrict, onDistrictSelect]);


  // 좌표를 SVG viewBox에 맞게 변환하는 함수
  const transformCoordinates = (coordinates: number[][][]) => {
    // 서울시 경계 (대략적인 범위)
    const seoulBounds = {
      minLng: 126.7,
      maxLng: 127.2,
      minLat: 37.4,
      maxLat: 37.7
    };

    const svgWidth = 800;
    const svgHeight = 600;

    return coordinates[0].map(([lng, lat]) => {
      const x = ((lng - seoulBounds.minLng) / (seoulBounds.maxLng - seoulBounds.minLng)) * svgWidth;
      const y = ((seoulBounds.maxLat - lat) / (seoulBounds.maxLat - seoulBounds.minLat)) * svgHeight;
      return [x, y];
    });
  };

  // 좌표 배열을 SVG path 문자열로 변환
  const coordinatesToPath = (coordinates: number[][][]) => {
    const transformed = transformCoordinates(coordinates);
    if (transformed.length === 0) return '';
    
    let path = `M ${transformed[0][0]} ${transformed[0][1]}`;
    for (let i = 1; i < transformed.length; i++) {
      path += ` L ${transformed[i][0]} ${transformed[i][1]}`;
    }
    path += ' Z';
    return path;
  };

  // 중심점 계산
  const getCenterPoint = (coordinates: number[][][]) => {
    const transformed = transformCoordinates(coordinates);
    if (transformed.length === 0) return [0, 0];
    
    const sumX = transformed.reduce((sum, [x]) => sum + x, 0);
    const sumY = transformed.reduce((sum, [, y]) => sum + y, 0);
    return [sumX / transformed.length, sumY / transformed.length];
  };

  if (!districts) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">지도를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* 헤더 */}
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800">
          서울특별시 {selectedDistrict ? districts?.features.find(d => d.properties.code === selectedDistrict)?.properties.name || '행정구 선택' : '행정구 선택'}
        </h2>
      </div>

      {/* 지도 컨테이너 */}
       {/* 인터랙티브 오버레이 - 실제 GeoJSON 데이터 사용 */}
       <div className="w-full h-full flex-1 min-h-0">
         <svg
           className="w-full h-full"
           viewBox="0 0 800 600"
           style={{ overflow: 'visible' }}
         >
          {/* 지도 영역들 */}
          {districts.features.map((feature) => {
            const pathData = coordinatesToPath(feature.geometry.coordinates);
            const districtId = feature.properties.code;
            
            return (
              <g 
                key={districtId}
                className="cursor-pointer"
                onClick={() => handleDistrictClick(districtId, feature.properties.name)}
                onMouseEnter={() => setHoveredDistrict(districtId)}
                onMouseLeave={() => setHoveredDistrict(null)}
              >
                <path
                  d={pathData}
                  fill={
                    selectedDistrict === districtId 
                      ? '#3288FF' 
                      : hoveredDistrict === districtId 
                        ? '#D1D5DB' 
                        : '#F5F5F5'
                  }
                  stroke="#D1D5DB"
                  strokeWidth="0.5"
                  className="district-path"
                />
              </g>
            );
          })}
          
          {/* 텍스트 레이어 - 별도로 렌더링 */}
          {districts.features.map((feature) => {
            const [centerX, centerY] = getCenterPoint(feature.geometry.coordinates);
            const districtId = feature.properties.code;
            
            return (
              <text
                key={`text-${districtId}`}
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-md font-medium pointer-events-none"
                style={{ 
                  fontSize: selectedDistrict === districtId ? '20px' : '15px',
                  fill: selectedDistrict === districtId ? '#FFFFFF' : '#374151',
                  textShadow: selectedDistrict === districtId 
                    ? '1px 1px 2px rgba(0,0,0,0.8)'
                    : 'none',
                  overflow: 'visible',
                  textOverflow: 'unset',
                  whiteSpace: 'nowrap'
                }}
              >
                {feature.properties.name}
              </text>
            );
          })}
        </svg>
      </div>
      <button
        onClick={onNextStep}
        className={`w-full py-3 px-4 rounded-lg transition-colors ${
          selectedDistrict 
            ? 'bg-gray-700 text-white cursor-pointer hover:bg-gray-800' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={!selectedDistrict}
      >
        다음 단계
      </button>
    </div>
  );
}