'use client';

import { useEffect, useRef, useState } from 'react';
import { useKakaoMapContext } from './KakaoMap';

declare global {
  interface Window {
    kakao: any;
  }
}

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

  console.log('CafeSearch 렌더링:', { isActive, map: !!map, kakao: typeof window !== 'undefined' ? !!window.kakao : false });

  // 초기화
  useEffect(() => {
    console.log('CafeSearch 초기화 시작:', { 
      map: !!map, 
      kakao: typeof window !== 'undefined' ? !!window.kakao : false,
      services: typeof window !== 'undefined' ? !!window.kakao?.maps?.services : false
    });
    
    if (!map || !window.kakao || !window.kakao.maps.services) {
      console.log('초기화 조건 불만족:', { 
        map: !!map, 
        kakao: !!window.kakao, 
        services: !!window.kakao?.maps?.services 
      });
      return;
    }

    console.log('카페 검색 초기화 진행');

    // 장소 검색 객체 생성
    psRef.current = new window.kakao.maps.services.Places(map);
    console.log('Places 객체 생성 완료');

    // 커스텀 오버레이 생성
    const overlay = new window.kakao.maps.CustomOverlay({ zIndex: 1 });
    const content = document.createElement('div');
    content.className = 'placeinfo_wrap';

    // 이벤트 핸들러 등록 (공식 코드와 동일)
    const preventMap = () => window.kakao.maps.event.preventMap();
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

  // 카테고리 검색을 요청하는 함수 (공식 코드와 동일)
  const searchPlaces = () => {
    if (!currCategoryRef.current) {
      console.log('currCategory가 없어서 검색하지 않음');
      return;
    }

    if (!psRef.current || !placeOverlayRef.current || !window.kakao?.maps?.services) {
      console.log('searchPlaces 조건 불만족:', { psRef: !!psRef.current, placeOverlay: !!placeOverlayRef.current, services: !!window.kakao?.maps?.services });
      return;
    }

    console.log('카페 검색 시작:', currCategoryRef.current);

    // 커스텀 오버레이를 숨깁니다
    placeOverlayRef.current.setMap(null);

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();

    // 카테고리 검색 실행
    psRef.current.categorySearch(currCategoryRef.current, placesSearchCB, { useMapBounds: true });
  };

  // 장소검색이 완료됐을 때 호출되는 콜백함수 (공식 코드와 동일)
  const placesSearchCB = (data: Place[], status: any) => {
    if (!window.kakao?.maps?.services) return;
    
    console.log('검색 결과:', { data: data?.length, status });
    
    if (status === window.kakao.maps.services.Status.OK) {
      // 정상적으로 검색이 완료됐으면 지도에 마커를 표출합니다
      console.log('검색 성공, 마커 표시 시작:', data.length);
      displayPlaces(data);
      showNotification(`${data.length}개의 카페를 찾았습니다.`);
    } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
      console.log('검색 결과 없음');
      showNotification('검색 결과가 없습니다.');
    } else if (status === window.kakao.maps.services.Status.ERROR) {
      console.log('검색 오류');
      showNotification('검색 중 오류가 발생했습니다.');
    }
  };

  // 지도에 마커를 표출하는 함수 (공식 코드와 동일)
  const displayPlaces = (places: Place[]) => {
    if (!map || !window.kakao?.maps) {
      console.log('displayPlaces 조건 불만족:', { map: !!map, kakao: !!window.kakao?.maps });
      return;
    }

    console.log('마커 표시 시작:', { places: places.length, mapCenter: map.getCenter() });

    const newMarkers: any[] = [];

    for (let i = 0; i < places.length; i++) {
      console.log(`마커 ${i} 생성 시도:`, places[i].place_name, places[i].y, places[i].x);
      
      // 마커를 생성하고 지도에 표시합니다 (공식 코드와 동일)
      const marker = addMarker(new window.kakao.maps.LatLng(places[i].y, places[i].x), 0);

      if (marker) {
        console.log('마커 생성 성공:', i, places[i].place_name);
        // 마커와 검색결과 항목을 클릭 했을 때 장소정보를 표출하도록 클릭 이벤트를 등록합니다
        (function(marker: any, place: Place) {
          window.kakao.maps.event.addListener(marker, 'click', function() {
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

  // 마커를 생성하고 지도 위에 마커를 표시하는 함수 (공식 코드와 동일)
  const addMarker = (position: any, order: number) => {
    if (!window.kakao?.maps || !map) {
      console.log('addMarker 조건 불만족:', { kakao: !!window.kakao?.maps, map: !!map });
      return null;
    }
    
    try {
      // 공식 코드와 동일한 마커 이미지 설정
      const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_category.png';
      const imageSize = new window.kakao.maps.Size(27, 28);
      const imgOptions = {
        spriteSize: new window.kakao.maps.Size(72, 208),
        spriteOrigin: new window.kakao.maps.Point(46, (order * 36)),
        offset: new window.kakao.maps.Point(11, 28)
      };
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions);
      
      const marker = new window.kakao.maps.Marker({
        position: position,
        image: markerImage
      });

      marker.setMap(map); // 지도 위에 마커를 표출합니다
      console.log('마커 생성 및 지도 추가 완료:', position.getLat(), position.getLng());
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

  // 클릭한 마커에 대한 장소 상세정보를 커스텀 오버레이로 표시하는 함수 (공식 코드와 동일)
  const displayPlaceInfo = (place: Place) => {
    if (!contentNodeRef.current || !placeOverlayRef.current || !window.kakao?.maps) return;

    let content = '<div class="placeinfo">' +
      '   <a class="title" href="' + place.place_url + '" target="_blank" title="' + place.place_name + '">' + place.place_name + '</a>';

    if (place.road_address_name) {
      content += '    <span title="' + place.road_address_name + '">' + place.road_address_name + '</span>' +
        '  <span class="jibun" title="' + place.address_name + '">(지번 : ' + place.address_name + ')</span>';
    } else {
      content += '    <span title="' + place.address_name + '">' + place.address_name + '</span>';
    }

    content += '    <span class="tel">' + place.phone + '</span>' +
      '</div>' +
      '<div class="after"></div>';

    contentNodeRef.current.innerHTML = content;
    placeOverlayRef.current.setPosition(new window.kakao.maps.LatLng(place.y, place.x));
    placeOverlayRef.current.setMap(map);
  };

  // 컴포넌트가 렌더링되지 않아도 기능은 동작
  return null;
}