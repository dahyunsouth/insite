'use client';

import { useEffect, useRef } from 'react';
import { useKakaoMap } from './KakaoMap';

type MapTypeControlProps = {
  position?: any; // kakao.maps.ControlPosition
};

export default function MapTypeControl({ 
  position = 'TOPRIGHT' 
}: MapTypeControlProps) {
  const map = useKakaoMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    // 지도 타입 컨트롤 생성
    const mapTypeControl = new window.kakao.maps.MapTypeControl();
    
    // 지도에 컨트롤 추가
    const controlPosition = window.kakao.maps.ControlPosition[position];
    map.addControl(mapTypeControl, controlPosition);
    
    controlRef.current = mapTypeControl;

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map, position]);

  return null;
}
