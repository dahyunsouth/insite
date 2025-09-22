"use client";

import React, { useEffect, useRef } from "react";

type DetailKakaoMapProps = {
  coordinates?: {
    lat: number;
    lng: number;
  };
  areaName?: string;
  height?: string;
};

/**
 * Atom: DetailKakaoMap
 * - 상권 중심 좌표로 지도를 표시하는 컴포넌트
 * - 카카오맵 API를 사용하여 해당 상권 위치를 표시
 */
export default function DetailKakaoMap({ 
  coordinates, 
  areaName,
  height = "300px"
}: DetailKakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    console.log('DetailKakaoMap useEffect 실행:', { coordinates, areaName });
    console.log('DetailKakaoMap coordinates 타입:', typeof coordinates, coordinates);
    
    if (!mapRef.current) {
      console.log('DetailKakaoMap: mapRef가 없음');
      return;
    }

    // 좌표가 없으면 기본 좌표 사용
    const coordsToUse = coordinates || { lat: 37.501309, lng: 127.039599 };
    console.log('DetailKakaoMap 사용할 좌표:', coordsToUse);
    console.log('DetailKakaoMap 좌표 유효성 검사:', {
      hasCoordinates: !!coordinates,
      lat: coordsToUse.lat,
      lng: coordsToUse.lng,
      isValidLat: coordsToUse.lat >= -90 && coordsToUse.lat <= 90,
      isValidLng: coordsToUse.lng >= -180 && coordsToUse.lng <= 180
    });

    function initializeMap() {
      console.log('DetailKakaoMap initializeMap 실행:', { coordsToUse, areaName });
      
      if (!mapRef.current) return;

      const container = mapRef.current;
      const options = {
        center: new (window as any).kakao.maps.LatLng(coordsToUse.lat, coordsToUse.lng),
        level: 3, // 지도 확대 레벨
      };

      console.log('DetailKakaoMap 지도 생성 시도:', options);

      const map = new (window as any).kakao.maps.Map(container, options);
      mapInstanceRef.current = map;

      // 마커 생성
      const markerPosition = new (window as any).kakao.maps.LatLng(coordsToUse.lat, coordsToUse.lng);
      const marker = new (window as any).kakao.maps.Marker({
        position: markerPosition,
      });

      marker.setMap(map);

      // 인포윈도우 생성
      if (areaName) {
        const infowindow = new (window as any).kakao.maps.InfoWindow({
          content: `<div style="padding:5px; font-size:12px;">${areaName}</div>`,
        });
        infowindow.open(map, marker);
      }

      console.log('DetailKakaoMap 지도 생성 완료');
    }

    // 카카오맵 API가 이미 로드되어 있는지 확인
    if (typeof window !== 'undefined' && (window as any).kakao && (window as any).kakao.maps) {
      console.log('DetailKakaoMap: 카카오맵 API 이미 로드됨, 바로 초기화');
      // API가 이미 로드되어 있으면 바로 초기화
      initializeMap();
    } else {
      console.log('DetailKakaoMap: 카카오맵 API 로드 대기 중...');
      // API가 로드되지 않은 경우 로드 완료를 기다림
      const checkKakao = () => {
        if ((window as any).kakao && (window as any).kakao.maps) {
          console.log('DetailKakaoMap: 카카오맵 API 로드 완료, 초기화 시작');
          initializeMap();
        } else {
          setTimeout(checkKakao, 100);
        }
      };
      checkKakao();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [coordinates, areaName]);

  return (
    <div className="w-full">
      <div 
        ref={mapRef}
        className="w-full rounded-lg overflow-hidden border border-gray-200"
        style={{ height }}
      />
    </div>
  );
}
