'use client';

import { useEffect, useRef } from 'react';
import { useKakaoMap, useKakaoMapContext } from './KakaoMap';

type CircleWithTextProps = {
  center: { lat: number; lng: number };
  radius: number; // meters
  strokeWeight?: number;
  strokeColor?: string;
  strokeOpacity?: number; // 0~1
  strokeStyle?: any;
  fillColor?: string;
  fillOpacity?: number; // 0~1
  text: string;
  subText?: string;
  fontSize?: number;
  subFontSize?: number;
  textColor?: string;
  fontWeight?: string;
  onClick?: () => void;
};

export default function CircleWithText({
  center,
  radius,
  strokeWeight = 0,
  strokeColor = 'transparent',
  strokeOpacity = 0,
  strokeStyle = 'solid',
  fillColor = '#3288FF',
  fillOpacity = 0.8,
  text,
  subText,
  fontSize = 22,
  subFontSize = 14,
  textColor = '#FFFFFF',
  fontWeight = 'bold',
  onClick,
}: CircleWithTextProps) {
  const map = useKakaoMap();
  const circleRef = useRef<any>(null);
  const textRef = useRef<any>(null);

  // 원 생성/제거
  useEffect(() => {
    if (!map) return;

    const circle = new window.kakao.maps.Circle({
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      radius,
      strokeWeight,
      strokeColor,
      strokeOpacity,
      strokeStyle,
      fillColor,
      fillOpacity,
    });

    // 클릭 이벤트 추가
    if (onClick) {
      window.kakao.maps.event.addListener(circle, 'click', onClick);
    }

    // 마우스 이벤트 추가 (커서 변경)
    window.kakao.maps.event.addListener(circle, 'mouseover', function() {
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        mapContainer.style.cursor = 'pointer';
      }
    });

    window.kakao.maps.event.addListener(circle, 'mouseout', function() {
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        mapContainer.style.cursor = '';
      }
    });

    circle.setMap(map);
    circleRef.current = circle;

    return () => {
      circle.setMap(null);
      circleRef.current = null;
    };
  }, [map]);

  // 텍스트 생성/제거
  useEffect(() => {
    if (!map) return;

    const textOverlay = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(center.lat, center.lng),
      content: `
        <div style="
          text-align: center;
          pointer-events: none;
          transform: translate(-50%, -50%);
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        ">
          <div style="
            color: ${textColor};
            font-size: ${fontSize}px;
            font-weight: ${fontWeight};
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            margin-bottom: 2px;
          ">
            ${text}
          </div>
          ${subText ? `
            <div style="
              color: ${textColor};
              font-size: ${subFontSize}px;
              font-weight: normal;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            ">
              ${subText}
            </div>
          ` : ''}
        </div>
      `,
      yAnchor: 0.5,
      xAnchor: 0.5,
    });

    textOverlay.setMap(map);
    textRef.current = textOverlay;

    return () => {
      textOverlay.setMap(null);
      textRef.current = null;
    };
  }, [map, center.lat, center.lng, text, subText, fontSize, subFontSize, textColor, fontWeight]);

  // 원 업데이트 (props 변경)
  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    circle.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    circle.setRadius(radius);
    circle.setStrokeWeight(strokeWeight);
    circle.setStrokeColor(strokeColor);
    circle.setStrokeOpacity(strokeOpacity);
    circle.setStrokeStyle(strokeStyle);
    circle.setFillColor(fillColor);
    circle.setFillOpacity(fillOpacity);
  }, [
    center.lat,
    center.lng,
    radius,
    strokeWeight,
    strokeColor,
    strokeOpacity,
    strokeStyle,
    fillColor,
    fillOpacity,
  ]);

  // 텍스트 업데이트 (props 변경)
  useEffect(() => {
    const textOverlay = textRef.current;
    if (!textOverlay) return;

    textOverlay.setPosition(new window.kakao.maps.LatLng(center.lat, center.lng));
    textOverlay.setContent(`
      <div style="
        text-align: center;
        pointer-events: none;
        transform: translate(-50%, -50%);
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      ">
        <div style="
          color: ${textColor};
          font-size: ${fontSize}px;
          font-weight: ${fontWeight};
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          margin-bottom: 2px;
        ">
          ${text}
        </div>
        ${subText ? `
          <div style="
            color: ${textColor};
            font-size: ${subFontSize}px;
            font-weight: normal;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          ">
            ${subText}
          </div>
        ` : ''}
      </div>
    `);
  }, [center.lat, center.lng, text, subText, fontSize, subFontSize, textColor, fontWeight]);

  return null; // 지도 위에만 그리므로 렌더링 없음
}

// 기본 예제 컴포넌트
export function DefaultCircleWithText() {
  const { showNotification } = useKakaoMapContext();

  const handleClick = () => {
    console.log('상권이 클릭되었습니다');
    showNotification('역삼역 상권이 선택되었습니다');
  };

  return (
    <CircleWithText
      center={{ lat: 37.5001, lng: 127.0355 }}
      radius={500}
      strokeWeight={0}
      strokeColor="transparent"
      strokeOpacity={0}
      fillColor="#3288FF"
      fillOpacity={0.8}
      text="역삼역"
      subText="23개"
      fontSize={22}
      subFontSize={14}
      textColor="#FFFFFF"
      fontWeight="bold"
      onClick={handleClick}
    />
  );
}
