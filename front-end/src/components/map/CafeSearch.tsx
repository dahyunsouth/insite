// @ts-nocheck
'use client';

import { useEffect, useRef, useState } from 'react';
import { useKakaoMapContext } from './KakaoMap';

interface Place {
  place_name: string;
  place_url: string;
  road_address_name?: string;
  address_name: string;
  phone: string;
  x: string;
  y: string;
}

interface CafeSearchProps {
  isActive: boolean;
}

export default function CafeSearch({ isActive }: CafeSearchProps) {
  const { map, showNotification } = useKakaoMapContext();
  const [markers, setMarkers] = useState<any[]>([]);
  const placeOverlayRef = useRef<any>(null);
  const contentNodeRef = useRef<HTMLDivElement | null>(null);
  const psRef = useRef<any>(null);
  const currCategoryRef = useRef<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log('CafeSearch 렌더링:', { isActive, map: !!map, kakao: typeof window !== 'undefined' ? !!window.kakao : false });

  // 초기화
  useEffect(() => {
    console.log('CafeSearch 초기화 시작:', { 
      map: !!map, 
      kakao: typeof window !== 'undefined' ? !!window.kakao : false,
      services: typeof window !== 'undefined' ? !!(window as any).kakao?.maps?.services : false
    });
    
    if (!map || !window.kakao || !(window.kakao as any).maps.services) {
      console.log('초기화 조건 불만족:', { 
        map: !!map, 
        kakao: !!window.kakao, 
        services: !!(window as any).kakao?.maps?.services 
      });
      return;
    }

    console.log('카페 검색 초기화 진행');

    // 장소 검색 객체 생성
    psRef.current = new (window as any).kakao.maps.services.Places(map);
    console.log('Places 객체 생성 완료');

    // 커스텀 오버레이 생성 (앵커 설정 포함, 높은 z-index로 상권명 박스보다 위에 표시)
    const overlay = new (window as any).kakao.maps.CustomOverlay({ 
      zIndex: 140,  // MAP_CUSTOM_OVERLAY 계층 사용
      xAnchor: 0.5,   // 가로 중앙
      yAnchor: 1.1    // 세로 하단 (마커 위쪽에 표시)
    });
    const content = document.createElement('div');
    content.className = 'placeinfo_wrap';

    // 이벤트 핸들러 등록 (공식 코드와 동일)
    const preventMap = () => (window as any).kakao.maps.event.preventMap();
    content.addEventListener('mousedown', preventMap);
    content.addEventListener('touchstart', preventMap);

    overlay.setContent(content);
    placeOverlayRef.current = overlay;
    contentNodeRef.current = content;

    console.log('CafeSearch 초기화 완료');

    // 초기화 완료 후 활성 상태라면 검색 실행
    if (isActive && currCategoryRef.current === 'CE7') {
      console.log('초기화 완료 후 검색 실행');
      setTimeout(() => searchPlaces(), 50);
    }

    return () => {
      // cleanup
      if (psRef.current) {
        psRef.current = null;
      }
      // 타이머 정리
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [map, isActive]);

  // isActive 변경 시 검색 실행
  useEffect(() => {
    console.log('CafeSearch isActive 변경:', { isActive, psRef: !!psRef.current, placeOverlay: !!placeOverlayRef.current });
    
    if (isActive) {
      console.log('카페 검색 활성화');
      currCategoryRef.current = 'CE7'; // 카페 카테고리 ID 설정
      
      // 초기화가 완료되지 않았다면 잠시 후 다시 시도
      if (!psRef.current || !placeOverlayRef.current) {
        console.log('초기화 대기 중, 200ms 후 재시도');
        setTimeout(() => {
          if (currCategoryRef.current === 'CE7') {
            console.log('지연된 검색 실행');
            searchPlaces();
          }
        }, 200);
      } else {
        console.log('즉시 검색 실행');
        searchPlaces();
      }
    } else {
      console.log('카페 검색 비활성화');
      currCategoryRef.current = '';
      removeMarker();
      if (placeOverlayRef.current) {
        placeOverlayRef.current.setMap(null);
      }
    }
  }, [isActive]);

  // 지도 이동 시 실시간 카페 재탐색
  useEffect(() => {
    if (!map || !isActive || !psRef.current) return;

    console.log('지도 이동 이벤트 리스너 등록');

    // 지도 이동 완료 시 카페 재탐색 (디바운싱 적용)
    const handleMapIdle = () => {
      if (currCategoryRef.current === 'CE7') {
        console.log('지도 이동 완료, 카페 재탐색 예약');
        
        // 기존 타이머가 있다면 취소
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        
        // 500ms 후에 재탐색 실행 (디바운싱)
        searchTimeoutRef.current = setTimeout(() => {
          console.log('디바운싱 완료, 카페 재탐색 시작');
          searchPlaces();
        }, 500);
      }
    };

    // 지도 이동 완료 이벤트 리스너 등록
    (window as any).kakao.maps.event.addListener(map, 'idle', handleMapIdle);

    // cleanup 함수에서 이벤트 리스너 제거
    return () => {
      if ((window as any).kakao?.maps?.event) {
        (window as any).kakao.maps.event.removeListener(map, 'idle', handleMapIdle);
      }
      // 타이머 정리
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [map, isActive]);

  // 카테고리 검색을 요청하는 함수 (공식 코드와 동일)
  const searchPlaces = () => {
    if (!currCategoryRef.current) {
      console.log('currCategory가 없어서 검색하지 않음');
      return;
    }

    if (!psRef.current || !placeOverlayRef.current || !(window as any).kakao?.maps?.services) {
      console.log('searchPlaces 조건 불만족:', { psRef: !!psRef.current, placeOverlay: !!placeOverlayRef.current, services: !!(window as any).kakao?.maps?.services });
      return;
    }

    console.log('카페 검색 시작:', currCategoryRef.current);

    // 커스텀 오버레이를 숨깁니다
    placeOverlayRef.current.setMap(null);

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();

    // 카테고리 검색 실행 (최대 15개 제한)
    psRef.current.categorySearch(currCategoryRef.current, placesSearchCB, { useMapBounds: true });
  };

  // 장소검색이 완료됐을 때 호출되는 콜백함수 (공식 코드와 동일)
  const placesSearchCB = (data: Place[], status: any) => {
    if (!(window as any).kakao?.maps?.services) return;
    
    console.log('검색 결과:', { data: data?.length, status });
    
    if (status === (window as any).kakao.maps.services.Status.OK) {
      // 정상적으로 검색이 완료됐으면 지도에 마커를 표출합니다
      console.log('검색 성공, 마커 표시 시작:', data.length);
      displayPlaces(data);
      showNotification(`최대 15개의 카페를 조회할 수 있습니다.`);
    } else if (status === (window as any).kakao.maps.services.Status.ZERO_RESULT) {
      console.log('검색 결과 없음');
      showNotification('검색 결과가 없습니다.');
    } else if (status === (window as any).kakao.maps.services.Status.ERROR) {
      console.log('검색 오류');
      showNotification('검색 중 오류가 발생했습니다.');
    }
  };

  // 지도에 마커를 표출하는 함수 (공식 코드와 동일)
  const displayPlaces = (places: Place[]) => {
    if (!map || !(window as any).kakao?.maps) {
      console.log('displayPlaces 조건 불만족:', { map: !!map, kakao: !!window.kakao?.maps });
      return;
    }

    console.log('마커 표시 시작:', { places: places.length, mapCenter: map.getCenter() });

    const newMarkers: any[] = [];

    for (let i = 0; i < places.length; i++) {
      console.log(`마커 ${i} 생성 시도:`, places[i].place_name, places[i].y, places[i].x);
      
      // 마커를 생성하고 지도에 표시합니다 (CE7 카페 카테고리 - 5번째 행이므로 order = 4)
      const marker = addMarker(new (window as any).kakao.maps.LatLng(places[i].y, places[i].x), 4);

      if (marker) {
        console.log('마커 생성 성공:', i, places[i].place_name);
        // 마커와 검색결과 항목을 클릭 했을 때 장소정보를 표출하도록 클릭 이벤트를 등록합니다
        (function(marker: any, place: Place) {
          (window as any).kakao.maps.event.addListener(marker, 'click', function() {
            displayPlaceInfo(place);
          });
        })(marker, places[i]);

        newMarkers.push(marker);
      } else {
        console.log('마커 생성 실패:', i, places[i].place_name);
      }
    }

    console.log('생성된 마커 개수:', newMarkers.length);
    setMarkers(newMarkers);
    
    // 마커가 지도에 표시되었는지 확인
    setTimeout(() => {
      console.log('마커 표시 확인:', newMarkers.length, '개 마커가 지도에 표시됨');
    }, 100);
  };

  // 마커를 생성하고 지도 위에 마커를 표시하는 함수 (커피컵 아이콘 사용)
  const addMarker = (position: any, order: number) => {
    if (!(window as any).kakao?.maps || !map) {
      console.log('addMarker 조건 불만족:', { kakao: !!(window as any).kakao?.maps, map: !!map });
      return null;
    }
    
    try {
      // 카카오맵 공식 스프라이트 이미지 사용 (커피컵 아이콘)
      const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_category.png';
      const imageSize = new (window as any).kakao.maps.Size(27, 28);
      const imgOptions = {
        spriteSize: new (window as any).kakao.maps.Size(72, 208),
        spriteOrigin: new (window as any).kakao.maps.Point(10, (order * 36)), // 카테고리별 order 값 사용
        offset: new (window as any).kakao.maps.Point(11, 28)
      };
      const markerImage = new (window as any).kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions);
      
      const marker = new (window as any).kakao.maps.Marker({
        position: position,
        image: markerImage,
        draggable: false
      });

      marker.setMap(map); // 지도 위에 마커를 표출합니다
      console.log('커피컵 마커 생성 및 지도 추가 완료:', position.getLat(), position.getLng());
      return marker;
    } catch (error) {
      console.error('마커 생성 중 오류:', error);
      return null;
    }
  };

  // 지도 위에 표시되고 있는 마커를 모두 제거합니다 (공식 코드와 동일)
  const removeMarker = () => {
    setMarkers(prevMarkers => {
      for (let i = 0; i < prevMarkers.length; i++) {
        prevMarkers[i].setMap(null);
      }
      return [];
    });
  };

  // 클릭한 마커에 대한 장소 상세정보를 커스텀 오버레이로 표시하는 함수 (카카오맵 스타일)
  const displayPlaceInfo = (place: Place) => {
    if (!contentNodeRef.current || !placeOverlayRef.current || !(window as any).kakao?.maps) return;

    // 카카오맵 스타일의 커스텀 오버레이 HTML 생성
    let content = '<div class="overlay_info" style="' +
      'background: white; ' +
      'border: 2px solid #E53935; ' +
      'border-radius: 12px; ' +
      'box-shadow: 0 4px 12px rgba(0,0,0,0.15); ' +
      'padding: 0; ' +
      'width: 280px; ' +
      'position: relative; ' +
      'font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;' +
      '">';
    
    // 헤더 부분 (가게명 + 닫기 버튼)
    content += '<div style="' +
      'background: #E53935; ' +
      'color: white; ' +
      'padding: 12px 16px; ' +
      'border-radius: 10px 10px 0 0; ' +
      'margin: 0; ' +
      'display: flex; ' +
      'justify-content: space-between; ' +
      'align-items: center;' +
      '">';
    content += '<a href="' + place.place_url + '" target="_blank" style="' +
      'color: white; ' +
      'text-decoration: none; ' +
      'font-weight: bold; ' +
      'font-size: 16px; ' +
      'flex: 1;' +
      '" title="' + place.place_name + '">' + place.place_name + '</a>';
    
    // 닫기 버튼 추가
    content += '<button style="' +
      'background: none; ' +
      'border: none; ' +
      'color: white; ' +
      'font-size: 18px; ' +
      'font-weight: normal; ' +
      'cursor: pointer; ' +
      'padding: 0; ' +
      'width: 24px; ' +
      'height: 24px; ' +
      'display: flex; ' +
      'align-items: center; ' +
      'justify-content: center; ' +
      'border-radius: 4px; ' +
      'transition: font-weight 0.2s ease; ' +
      'margin-left: 8px;' +
      '" ' +
      'onmouseover="this.style.fontWeight=\'bold\'" ' +
      'onmouseout="this.style.fontWeight=\'normal\'" ' +
      'title="닫기">×</button>';
    
    content += '</div>';
    
    // 내용 부분
    content += '<div style="padding: 16px;">';
    
    // 주소 정보
    content += '<div style="margin-bottom: 8px;">';
    content += '<div style="' +
      'display: flex; ' +
      'align-items: flex-start; ' +
      'gap: 8px; ' +
      'margin-bottom: 4px;' +
      '">';
    content += '<span style="' +
      'color: #666; ' +
      'font-size: 12px; ' +
      'font-weight: 500; ' +
      'min-width: 32px; ' +
      'margin-top: 2px;' +
      '">주소</span>';
    
    if (place.road_address_name) {
      content += '<div>';
      content += '<div style="' +
        'color: #333; ' +
        'font-size: 14px; ' +
        'line-height: 1.4; ' +
        'margin-bottom: 2px;' +
        '" title="' + place.road_address_name + '">' + place.road_address_name + '</div>';
      content += '<div style="' +
        'color: #999; ' +
        'font-size: 12px; ' +
        'line-height: 1.3;' +
        '" title="' + place.address_name + '">(지번: ' + place.address_name + ')</div>';
      content += '</div>';
    } else {
      content += '<div style="' +
        'color: #333; ' +
        'font-size: 14px; ' +
        'line-height: 1.4;' +
        '" title="' + place.address_name + '">' + place.address_name + '</div>';
    }
    content += '</div>';
    content += '</div>';
    
    // 전화번호 (있는 경우만)
    if (place.phone) {
      content += '<div style="' +
        'display: flex; ' +
        'align-items: center; ' +
        'gap: 8px; ' +
        'margin-bottom: 8px;' +
        '">';
      content += '<span style="' +
        'color: #666; ' +
        'font-size: 12px; ' +
        'font-weight: 500; ' +
        'min-width: 32px;' +
        '">전화</span>';
      content += '<a href="tel:' + place.phone + '" style="' +
        'color: #E53935; ' +
        'font-size: 14px; ' +
        'text-decoration: none; ' +
        'font-weight: 500;' +
        '">' + place.phone + '</a>';
      content += '</div>';
    }
    
    content += '</div>';
    
    // 하단 화살표
    content += '<div style="' +
      'position: absolute; ' +
      'bottom: -8px; ' +
      'left: 50%; ' +
      'transform: translateX(-50%); ' +
      'width: 0; ' +
      'height: 0; ' +
      'border-left: 8px solid transparent; ' +
      'border-right: 8px solid transparent; ' +
      'border-top: 8px solid #E53935;' +
      '"></div>';
    
    content += '</div>';

    contentNodeRef.current.innerHTML = content;
    
    // 닫기 버튼 이벤트 리스너 등록
    const closeButton = contentNodeRef.current.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        if (placeOverlayRef.current) {
          placeOverlayRef.current.setMap(null);
        }
      });
    }
    
    // 오버레이 위치 설정 (마커 위쪽에 표시)
    placeOverlayRef.current.setPosition(new (window as any).kakao.maps.LatLng(place.y, place.x));
    placeOverlayRef.current.setMap(map);
  };

  // 컴포넌트가 렌더링되지 않아도 기능은 동작
  return null;
}