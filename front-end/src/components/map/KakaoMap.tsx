'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

export default function FullScreenKakaoMap() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapContainer.current) return;

        const options = {
          center: new window.kakao.maps.LatLng(37.501309, 127.039599),
          level: 3
        };

        const map = new window.kakao.maps.Map(mapContainer.current, options);
      });
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      id="map"
      ref={mapContainer}
      className="fixed inset-0 w-screen h-screen z-0"
    />
  );
}