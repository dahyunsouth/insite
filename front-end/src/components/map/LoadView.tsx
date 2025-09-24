'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useKakaoMapContext } from './KakaoMap';

declare global {
  interface Window {
    kakao: {
      maps: {
        Roadview: new (container: HTMLElement) => {
          setPanoId: (panoId: string, position: { getLat: () => number; getLng: () => number }) => void;
          getPosition: () => { getLat: () => number; getLng: () => number };
        };
        RoadviewClient: new () => {
          getNearestPanoId: (position: { getLat: () => number; getLng: () => number }, radius: number, callback: (panoId: string | null) => void) => void;
        };
        Marker: new (options: {
          image: any;
          position: { getLat: () => number; getLng: () => number };
          draggable: boolean;
        }) => {
          setMap: (map: any) => void;
          setPosition: (position: { getLat: () => number; getLng: () => number }) => void;
          getPosition: () => { getLat: () => number; getLng: () => number };
        };
        MarkerImage: new (src: string, size: any, options?: any) => any;
        Size: new (width: number, height: number) => any;
        Point: new (x: number, y: number) => any;
        MapTypeId: {
          ROADVIEW: any;
        };
        event: {
          addListener: (target: any, event: string, handler: (...args: any[]) => void) => void;
        };
      };
    };
  }
}

interface LoadViewProps {
  isActive: boolean;
  isMinimized?: boolean;
  onToggle: (action: boolean | 'minimize' | 'restore') => void;
  onStateChange?: (isActive: boolean, isMinimized: boolean) => void;
}

export default function LoadView({ isActive, isMinimized: externalIsMinimized, onToggle }: LoadViewProps) {
  const { map } = useKakaoMapContext();
  const rvContainer = useRef<HTMLDivElement>(null);
  const rv = useRef<any>(null);
  const rvClient = useRef<any>(null);
  const marker = useRef<any>(null);
  
  // SSR 안전성을 위한 클라이언트 전용 렌더링
  const [isClient, setIsClient] = useState(false);
  const [overlayOn, setOverlayOn] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // 최소화 상태 추가
  const [position, setPosition] = useState({ x: 1000, y: 20 }); // 상단 여백을 20px로 설정
  const [size, setSize] = useState({ width: 640, height: 360 }); // 1/3 크기로 초기값 변경
  // const [originalSize, setOriginalSize] = useState({ width: 640, height: 360 }); // 사용하지 않음
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [preFullscreenPosition, setPreFullscreenPosition] = useState({ x: 0, y: 0 }); // 전체화면 전 위치 저장
  const [preFullscreenSize, setPreFullscreenSize] = useState({ width: 0, height: 0 }); // 전체화면 전 크기 저장

  // 클라이언트에서만 렌더링되도록 설정
  useEffect(() => {
    setIsClient(true);
  }, []);

  // SSR 안전성을 위한 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 저장된 위치와 크기가 있으면 사용, 없으면 기본값 사용
      const defaultSize = {
        width: window.innerWidth / 3,
        height: window.innerHeight / 3
      };
      const defaultPosition = {
        x: window.innerWidth - (window.innerWidth / 3) - 20,
        y: 20
      };
      
      // 저장된 값이 있으면 사용 (크기가 0이 아닌 경우)
      if (preFullscreenSize.width > 0 && preFullscreenSize.height > 0) {
        setSize(preFullscreenSize);
        // setOriginalSize(preFullscreenSize); // 사용하지 않음
        setPosition(preFullscreenPosition);
      } else {
        setSize(defaultSize);
        // setOriginalSize(defaultSize); // 사용하지 않음
        setPosition(defaultPosition);
      }
    }
  }, []); // 의존성 배열을 비워서 한 번만 실행되도록 수정

  // 전달받은 좌표(position)에 가까운 로드뷰의 파노라마 ID를 추출하여 로드뷰를 설정하는 함수 (카카오맵 공식 코드 방식)
  const toggleRoadview = useCallback((position: { getLat: () => number; getLng: () => number }) => {
    if (!rvClient.current || !rv.current) return;

    rvClient.current.getNearestPanoId(position, 50, function(panoId: string | null) {
      if (panoId === null) {
        // 파노라마 ID가 null 이면 로드뷰를 숨깁니다 (공식 코드와 동일)
        // eslint-disable-next-line no-console
        console.log('로드뷰 파노라마 ID가 null입니다. 로드뷰를 숨깁니다.');
      } else {
        // panoId로 로드뷰를 설정합니다 (공식 코드와 동일)
        // eslint-disable-next-line no-console
        console.log('로드뷰 파노라마 ID 설정:', panoId, '위치:', position);
        rv.current.setPanoId(panoId, position);
      }
    });
  }, []);

  // 지도를 감싸고 있는 div의 크기를 조정하는 함수 (현재 사용하지 않음)
  // const toggleMapWrapper = useCallback((active: boolean, position: { getLat: () => number; getLng: () => number }) => {
  //   // 이 함수는 현재 사용하지 않습니다
  // }, [map]);

  // 지도 위의 로드뷰 도로 오버레이를 추가,제거하는 함수 (카카오맵 공식 코드 방식)
  const toggleOverlay = useCallback((active: boolean) => {
    // eslint-disable-next-line no-console
    console.log('toggleOverlay 호출됨:', { active, map: !!map, marker: !!marker.current });
    
    if (!map || !marker.current) {
      // eslint-disable-next-line no-console
      console.warn('toggleOverlay: map 또는 marker가 없습니다', { 
        map: !!map, 
        marker: !!marker.current,
        mapCenter: map ? map.getCenter() : null
      });
      return;
    }

    if (active) {
      try {
        // 지도 위에 로드뷰 도로 오버레이를 추가합니다 (공식 코드와 동일)
        map.addOverlayMapTypeId(window.kakao.maps.MapTypeId.ROADVIEW);
        // eslint-disable-next-line no-console
        console.log('로드뷰 오버레이 추가 완료');
        
        // 지도 위에 마커를 표시합니다 (공식 코드와 동일)
        marker.current.setMap(map);
        // eslint-disable-next-line no-console
        console.log('마커를 지도에 추가 완료');
        
        // 마커의 위치를 지도 중심으로 설정합니다 (공식 코드와 동일)
        const center = map.getCenter();
        marker.current.setPosition(center);
        // eslint-disable-next-line no-console
        console.log('마커 위치 설정 완료:', center);
        
        // 로드뷰를 오른쪽 상단에 표시하도록 위치와 크기 설정
        if (typeof window !== 'undefined') {
          const rightX = window.innerWidth - size.width - 20; // 오른쪽에서 20px 여백
          const topY = 20; // 상단에서 20px 여백
          setPosition({ x: rightX, y: topY });
          // eslint-disable-next-line no-console
          console.log('로드뷰를 오른쪽 상단에 배치:', { x: rightX, y: topY, size });
        }
        
        // 로드뷰의 위치를 지도 중심으로 설정합니다 (공식 코드와 동일)
        toggleRoadview(center);
        
        // eslint-disable-next-line no-console
        console.log('로드뷰 오버레이 활성화 및 마커 표시 완료');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('toggleOverlay 활성화 중 오류:', error);
      }
    } else {
      try {
        // 지도 위의 로드뷰 도로 오버레이를 제거합니다 (공식 코드와 동일)
        map.removeOverlayMapTypeId(window.kakao.maps.MapTypeId.ROADVIEW);
        // eslint-disable-next-line no-console
        console.log('로드뷰 오버레이 제거 완료');
        
        // 지도 위의 마커를 제거합니다 (공식 코드와 동일)
        marker.current.setMap(null);
        // eslint-disable-next-line no-console
        console.log('마커를 지도에서 제거 완료');
        
        // eslint-disable-next-line no-console
        console.log('로드뷰 오버레이 비활성화 및 마커 제거 완료');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('toggleOverlay 비활성화 중 오류:', error);
      }
    }
  }, [map, toggleRoadview, size]);

  // 외부 isActive 상태와 내부 overlayOn 상태 동기화
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('상태 동기화 체크:', { isActive, overlayOn, isMinimized, map: !!map, marker: !!marker.current });
    
    // 상태가 실제로 다를 때만 동기화 (map과 marker가 준비된 상태에서만)
    if (isActive !== overlayOn && map && marker.current) {
      // eslint-disable-next-line no-console
      console.log('상태 불일치 감지, 동기화 시작:', { isActive, overlayOn, isMinimized });
      
      if (isActive) {
        // 로드뷰가 활성화되면 오른쪽 상단에 배치
        if (typeof window !== 'undefined') {
          const rightX = window.innerWidth - size.width - 20; // 오른쪽에서 20px 여백
          const topY = 20; // 상단에서 20px 여백
          setPosition({ x: rightX, y: topY });
          // eslint-disable-next-line no-console
          console.log('로드뷰를 오른쪽 상단에 배치 (상태 동기화):', { x: rightX, y: topY, size });
        }
        
        // 로드뷰가 활성화되면 오버레이 활성화
        setOverlayOn(true);
        // eslint-disable-next-line no-console
        console.log('로드뷰 활성화 요청');
        toggleOverlay(true);
      } else {
        // 로드뷰가 비활성화되면 오버레이 비활성화
        setOverlayOn(false);
        // eslint-disable-next-line no-console
        console.log('로드뷰 비활성화 요청');
        toggleOverlay(false);
      }
    }
  }, [isActive, overlayOn, toggleOverlay, map, size]); // 저장된 위치와 크기 의존성 제거하여 무한 루프 방지

  // 외부 isMinimized 상태와 내부 isMinimized 상태 동기화
  useEffect(() => {
    if (externalIsMinimized !== undefined && externalIsMinimized !== isMinimized) {
      setIsMinimized(externalIsMinimized);
    }
  }, [externalIsMinimized, isMinimized]);

  // 상태 변경 시 부모에게 알림 (무한 루프 방지를 위해 주석 처리)
  // useEffect(() => {
  //   if (onStateChange) {
  //     onStateChange(overlayOn, isMinimized);
  //   }
  // }, [overlayOn, isMinimized, onStateChange]);

  // 로드뷰 객체 생성 (카카오맵 공식 코드 방식)
  useEffect(() => {
    if (!map || !window.kakao) return;

    // 이미 로드뷰 객체가 있다면 재사용
    if (rv.current) return;

    // Portal이 DOM에 마운트될 때까지 대기
    const initRoadview = () => {
      if (!rvContainer.current) return;

      // 로드뷰 내용 영역을 찾아서 로드뷰 객체 생성
      const roadviewContent = rvContainer.current.querySelector('.roadview-content') as HTMLElement;
      if (roadviewContent) {
        try {
          // 로드뷰 객체를 생성합니다 (공식 코드와 동일)
          rv.current = new window.kakao.maps.Roadview(roadviewContent);
          
          // 좌표로부터 로드뷰 파노라마 ID를 가져올 로드뷰 클라이언트 객체를 생성합니다 (공식 코드와 동일)
          rvClient.current = new window.kakao.maps.RoadviewClient();

          // 로드뷰에 좌표가 바뀌었을 때 발생하는 이벤트를 등록합니다 (공식 코드와 동일)
          window.kakao.maps.event.addListener(rv.current, 'position_changed', function() {
            if (!rv.current || !marker.current) return;

            // 현재 로드뷰의 위치 좌표를 얻어옵니다 (공식 코드와 동일)
            const rvPosition = rv.current.getPosition();

            // 지도의 중심을 현재 로드뷰의 위치로 설정합니다 (공식 코드와 동일)
            map.setCenter(rvPosition);

            // 지도 위에 로드뷰 도로 오버레이가 추가된 상태이면 (공식 코드와 동일)
            if (overlayOn) {
              // 마커의 위치를 현재 로드뷰의 위치로 설정합니다 (공식 코드와 동일)
              marker.current.setPosition(rvPosition);
            }
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('로드뷰 객체 생성 중 오류:', error);
        }
      }
    };

    // Portal이 DOM에 마운트된 후 실행
    const timer = setTimeout(initRoadview, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [map]); // overlayOn 의존성 제거하여 로드뷰 객체가 한 번만 생성되도록 수정
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // 마커 초기화 (개선된 방식)
  useEffect(() => {
    if (!map || !window.kakao) {
      // eslint-disable-next-line no-console
      console.log('마커 초기화: map 또는 kakao가 없습니다', { map: !!map, kakao: !!window.kakao });
      return;
    }

    // 마커가 이미 있다면 정리
    if (marker.current) {
      try {
        marker.current.setMap(null);
        // eslint-disable-next-line no-console
        console.log('기존 마커 제거 완료');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('기존 마커 제거 중 오류:', error);
      }
      marker.current = null;
    }

    // 마커 초기화 함수
    const initMarker = () => {
      if (!map || !window.kakao) {
        // eslint-disable-next-line no-console
        console.warn('initMarker: map 또는 kakao가 없습니다');
        return;
      }

      try {
        // eslint-disable-next-line no-console
        console.log('마커 초기화 시작...');
        
        // 마커 이미지를 생성합니다 (카카오맵 로드뷰 전용 마커)
        const markImage = new window.kakao.maps.MarkerImage(
          'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/roadview_minimap_wk_2018.png',
          new window.kakao.maps.Size(26, 46),
          {
            // 스프라이트 이미지를 사용합니다.
            // 스프라이트 이미지 전체의 크기를 지정하고
            spriteSize: new window.kakao.maps.Size(1666, 168),
            // 사용하고 싶은 영역의 좌상단 좌표를 입력합니다.
            // background-position으로 지정하는 값이며 부호는 반대입니다.
            spriteOrigin: new window.kakao.maps.Point(705, 114),
            offset: new window.kakao.maps.Point(13, 46)
          }
        );

        // 드래그가 가능한 마커를 생성합니다 (공식 코드와 동일)
        marker.current = new window.kakao.maps.Marker({
          image: markImage,
          position: map.getCenter(),
          draggable: true
        });

        // 마커는 생성만 하고 즉시 표시하지 않음 (toggleOverlay에서 표시)
        // eslint-disable-next-line no-console
        console.log('마커 생성 완료 (표시는 toggleOverlay에서 처리)');

        // 마커에 dragend 이벤트를 등록합니다
        const dragendHandler = function() {
          if (!marker.current) return;
          // 현재 마커가 놓인 자리의 좌표입니다
          const position = marker.current.getPosition();
          // 마커가 놓인 위치를 기준으로 로드뷰를 설정합니다
          toggleRoadview(position);
        };
        window.kakao.maps.event.addListener(marker.current, 'dragend', dragendHandler);

        // 지도에 클릭 이벤트를 등록합니다
        const clickHandler = function(...args: unknown[]) {
          // 지도 위에 로드뷰 도로 오버레이가 추가된 상태가 아니면 클릭이벤트를 무시합니다
          if (!overlayOn) {
            return;
          }

          const mouseEvent = args[0] as { latLng: { getLat: () => number; getLng: () => number } };
          // 클릭한 위치의 좌표입니다
          const position = mouseEvent.latLng;

          // 마커를 클릭한 위치로 옮깁니다
          if (marker.current) {
            marker.current.setPosition(position);
            // 클릭한 위치를 기준으로 로드뷰를 설정합니다
            toggleRoadview(position);
          }
        };
        window.kakao.maps.event.addListener(map, 'click', clickHandler);

        // 마커가 생성되었음을 콘솔에 출력
        // eslint-disable-next-line no-console
        console.log('로드뷰 마커가 성공적으로 생성되었습니다:', {
          marker: marker.current,
          position: map.getCenter(),
          draggable: true
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('마커 초기화 중 오류:', error);
      }
    };

    // 지연 실행으로 마커 초기화
    const timer = setTimeout(initMarker, 200);

    // cleanup 함수
    return () => {
      clearTimeout(timer);
      
      // 마커가 지도에 추가되어 있다면 제거
      if (marker.current) {
        try {
          marker.current.setMap(null);
          // eslint-disable-next-line no-console
          console.log('마커 cleanup 완료');
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('마커 제거 중 오류:', error);
        }
        marker.current = null;
      }
      
      // 로드뷰 오버레이 제거
      if (map && typeof window !== 'undefined' && window.kakao) {
        try {
          const overlayTypes = map.getOverlayMapTypes();
          if (overlayTypes && overlayTypes.length > 0) {
            map.removeOverlayMapTypeId(window.kakao.maps.MapTypeId.ROADVIEW);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('로드뷰 오버레이 제거 중 오류:', error);
        }
      }
    };
  }, [map, toggleRoadview]); // overlayOn 의존성 제거하여 마커가 한 번만 생성되도록 수정
  // eslint-disable-next-line react-hooks/exhaustive-deps


  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFullscreen) return;

    const target = e.target as HTMLElement;
    const isDragHandle = target.closest('.drag-handle');
    const isResizeHandle = target.closest('.resize-handle');

    if (isDragHandle) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    } else if (isResizeHandle) {
      setIsResizing(true);
      const direction = (e.target as HTMLElement).getAttribute('data-direction') || '';
      setResizeDirection(direction);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      if (typeof window !== 'undefined') {
        setPosition({
          x: Math.max(0, Math.min(newX, window.innerWidth - size.width)),
          y: Math.max(0, Math.min(newY, window.innerHeight - size.height))
        });
      }
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      if (typeof window !== 'undefined') {
        let newWidth = size.width;
        let newHeight = size.height;
        let newX = position.x;
        let newY = position.y;
        
        switch (resizeDirection) {
          case 'se': // 우하단: 너비와 높이 증가
            newWidth = Math.max(300, Math.min(resizeStart.width + deltaX, window.innerWidth - position.x));
            newHeight = Math.max(200, Math.min(resizeStart.height + deltaY, window.innerHeight - position.y));
            break;
          case 'sw': // 좌하단: 너비 감소, 높이 증가, X 위치 조정
            newWidth = Math.max(300, Math.min(resizeStart.width - deltaX, position.x + size.width));
            newHeight = Math.max(200, Math.min(resizeStart.height + deltaY, window.innerHeight - position.y));
            newX = position.x + (size.width - newWidth);
            break;
          case 'ne': // 우상단: 너비 증가, 높이 감소, Y 위치 조정
            newWidth = Math.max(300, Math.min(resizeStart.width + deltaX, window.innerWidth - position.x));
            newHeight = Math.max(200, Math.min(resizeStart.height - deltaY, position.y + size.height));
            newY = position.y + (size.height - newHeight);
            break;
          case 'nw': // 좌상단: 너비와 높이 감소, X와 Y 위치 조정
            newWidth = Math.max(300, Math.min(resizeStart.width - deltaX, position.x + size.width));
            newHeight = Math.max(200, Math.min(resizeStart.height - deltaY, position.y + size.height));
            newX = position.x + (size.width - newWidth);
            newY = position.y + (size.height - newHeight);
            break;
        }
        
        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart, size, position, resizeDirection]);

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  };

  const handleFullscreenToggle = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('전체화면 토글 버튼 클릭:', { isFullscreen });
    
    if (isFullscreen) {
      // 전체화면 해제 - 이전 위치와 크기로 복원
      // eslint-disable-next-line no-console
      console.log('전체화면 해제');
      setSize(preFullscreenSize);
      setPosition(preFullscreenPosition);
      setIsFullscreen(false);
    } else {
      // 전체화면 설정 - 현재 위치와 크기 저장
      // eslint-disable-next-line no-console
      console.log('전체화면 설정');
      setPreFullscreenPosition(position);
      setPreFullscreenSize(size);
      // setOriginalSize(size); // 사용하지 않음
      if (typeof window !== 'undefined') {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
        setPosition({ x: 0, y: 0 });
      }
      setIsFullscreen(true);
    }
  }, [isFullscreen, position, size, preFullscreenPosition, preFullscreenSize]); // 필요한 의존성 추가

  // 전역 마우스 이벤트 등록
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove]);


  // 로드뷰에서 X버튼을 눌렀을 때 로드뷰 모드를 완전히 종료하는 함수
  const closeRoadview = () => {
    // eslint-disable-next-line no-console
    console.log('로드뷰 X버튼 클릭 - 로드뷰 모드 완전 종료');
    
    // 현재 위치와 크기를 저장 (다음에 로드뷰를 열 때 사용)
    setPreFullscreenPosition(position);
    setPreFullscreenSize(size);
    
    // 외부 상태를 false로 설정하여 로드뷰 모드 완전 종료
    if (onToggle) {
      onToggle(false);
      // eslint-disable-next-line no-console
      console.log('외부 상태를 false로 설정하여 로드뷰 모드 완전 종료');
    }
  };

  // React Portal을 사용하여 body에 직접 렌더링
  const portalContent = (
    <div
      ref={rvContainer}
      id="roadview"
      className="fixed border-2 border-gray-300 rounded-lg shadow-2xl bg-white overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 700, // 오버레이 계층 (LoadView는 특별한 경우이므로 OVERLAY 계층 사용)
        cursor: isFullscreen ? 'default' : isDragging ? 'grabbing' : isResizing ? 'nw-resize' : 'grab',
        display: (overlayOn && !isMinimized) ? 'block' : 'none', // overlayOn이 true이고 최소화되지 않았을 때만 표시
        visibility: (overlayOn && !isMinimized) ? 'visible' : 'hidden', // 추가적인 안전장치
        pointerEvents: (overlayOn && !isMinimized) ? 'auto' : 'none', // 숨겨진 상태에서 이벤트 차단
        position: 'fixed', // fixed 포지셔닝으로 DOM 트리 독립성 확보
        transform: 'translateZ(0)' // 하드웨어 가속으로 렌더링 최적화
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 드래그 핸들 (상단 바) */}
      <div 
        className={`drag-handle w-full h-8 bg-gray-200 flex items-center px-2 ${isFullscreen ? 'cursor-default justify-center relative' : 'cursor-grab active:cursor-grabbing justify-between'}`}
        style={{ backgroundColor: '#f3f4f6' }}
      >
        {isFullscreen ? (
          <>
            {/* 전체화면일 때: 제목을 중앙에, 버튼들을 오른쪽에 */}
            <span className="text-sm font-medium text-gray-700">로드뷰</span>
            <div className="absolute right-2 flex items-center gap-2">
              <button
                onClick={handleFullscreenToggle}
                className="cursor-pointer w-6 h-6 bg-green-600 text-white rounded flex items-center justify-center hover:bg-green-700 transition-all text-xs"
                title={isFullscreen ? '창 모드로 전환' : '전체화면으로 전환'}
              >
                {/* 양방향 화살표 아이콘 */}
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  {isFullscreen ? (
                    <>
                      {/* 창 모드 아이콘 */}
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </>
                  ) : (
                    <>
                      {/* 전체화면 아이콘 */}
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </>
                  )}
                </svg>
              </button>
              <button
                onClick={closeRoadview}
                className="cursor-pointer w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-all text-xs"
                title="로드뷰 모드 완전 종료"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 일반 모드일 때: 기존 레이아웃 */}
            <span className="text-sm font-medium text-gray-700">로드뷰</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFullscreenToggle}
                className="cursor-pointer w-6 h-6 bg-green-600 text-white rounded flex items-center justify-center hover:bg-green-700 transition-all text-xs"
                title={isFullscreen ? '창 모드로 전환' : '전체화면으로 전환'}
              >
                {/* 양방향 화살표 아이콘 */}
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  {isFullscreen ? (
                    <>
                      {/* 창 모드 아이콘 */}
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </>
                  ) : (
                    <>
                      {/* 전체화면 아이콘 */}
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </>
                  )}
                </svg>
              </button>
              <button
                onClick={closeRoadview}
                className="cursor-pointer w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-all text-xs"
                title="로드뷰 모드 완전 종료"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 로드뷰 내용 영역 */}
      <div className="roadview-content w-full h-full" style={{ height: `${size.height - 32}px` }} />

      {/* 리사이즈 핸들 - 4개 꼭지점 */}
      {!isFullscreen && (
        <>
          {/* 우하단 꼭지점 (SE) */}
          <div
            className="resize-handle absolute bottom-0 right-0 w-3 h-3 cursor-nw-resize transform translate-x-1/2 translate-y-1/2"
            data-direction="se"
            style={{ backgroundColor: '#9ca3af', borderRadius: '50%' }}
          />
          {/* 좌하단 꼭지점 (SW) */}
          <div
            className="resize-handle absolute bottom-0 left-0 w-3 h-3 cursor-ne-resize transform -translate-x-1/2 translate-y-1/2"
            data-direction="sw"
            style={{ backgroundColor: '#9ca3af', borderRadius: '50%' }}
          />
          {/* 우상단 꼭지점 (NE) */}
          <div
            className="resize-handle absolute top-0 right-0 w-3 h-3 cursor-sw-resize transform translate-x-1/2 -translate-y-1/2"
            data-direction="ne"
            style={{ backgroundColor: '#9ca3af', borderRadius: '50%' }}
          />
          {/* 좌상단 꼭지점 (NW) */}
          <div
            className="resize-handle absolute top-0 left-0 w-3 h-3 cursor-se-resize transform -translate-x-1/2 -translate-y-1/2"
            data-direction="nw"
            style={{ backgroundColor: '#9ca3af', borderRadius: '50%' }}
          />
        </>
      )}
    </div>
  );

  // SSR 안전성을 위해 클라이언트에서만 렌더링
  if (!isClient) {
    return null;
  }

  // React Portal을 사용하여 body에 직접 렌더링
  return typeof window !== 'undefined' ? createPortal(portalContent, document.body) : null;
}