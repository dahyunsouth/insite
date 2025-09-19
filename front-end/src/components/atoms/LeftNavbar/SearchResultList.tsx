"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useKakaoMapContext } from "@/components/map/KakaoMap";

// 검색 결과 타입 정의
interface SearchPlace {
  place_name: string;
  place_url: string;
  road_address_name?: string;
  address_name: string;
  phone: string;
  x: string;
  y: string;
}

interface SearchResultListProps {
  isVisible: boolean;
  searchKeyword: string;
  onClose: () => void;
}

const SearchResultList = ({ isVisible, searchKeyword, onClose }: SearchResultListProps) => {
  const { map, showNotification } = useKakaoMapContext();
  const [searchResults, setSearchResults] = useState<SearchPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const psRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infowindowRef = useRef<any>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Places API 초기화
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!map || !(window as any).kakao || !(window as any).kakao.maps.services) return;

    // 장소 검색 객체 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    psRef.current = new (window as any).kakao.maps.services.Places();
    
    // 인포윈도우 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    infowindowRef.current = new (window as any).kakao.maps.InfoWindow({ zIndex: 1 });

    return () => {
      if (psRef.current) {
        psRef.current = null;
      }
    };
  }, [map]);

  // 인포윈도우 표시
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayInfowindow = useCallback((marker: any, title: string) => {
    if (!infowindowRef.current) return;

    const content = `<div style="padding:5px;z-index:1;">${title}</div>`;
    infowindowRef.current.setContent(content);
    infowindowRef.current.open(map, marker);
  }, [map]);

  // 마커 생성
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addMarker = useCallback((position: any, index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).kakao?.maps || !map) return null;

    try {
      // 마커 이미지 설정 (번호가 있는 파란색 마커)
      const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imageSize = new (window as any).kakao.maps.Size(36, 37);
      const imgOptions = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spriteSize: new (window as any).kakao.maps.Size(36, 691),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spriteOrigin: new (window as any).kakao.maps.Point(0, (index * 46) + 10),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        offset: new (window as any).kakao.maps.Point(13, 37)
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const markerImage = new (window as any).kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const marker = new (window as any).kakao.maps.Marker({
        position: position,
        image: markerImage
      });

      marker.setMap(map);
      return marker;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('마커 생성 중 오류:', error);
      return null;
    }
  }, [map]);

  // 검색 결과를 지도에 표시
  const displayPlaces = useCallback((places: SearchPlace[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!map || !(window as any).kakao?.maps) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newMarkers: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bounds = new (window as any).kakao.maps.LatLngBounds();

    for (let i = 0; i < places.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const position = new (window as any).kakao.maps.LatLng(places[i].y, places[i].x);
      const marker = addMarker(position, i);

      if (marker) {
        // 마커 클릭 이벤트
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (function(marker: any, place: SearchPlace, index: number) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).kakao.maps.event.addListener(marker, 'click', function() {
            displayInfowindow(marker, place.place_name);
            setSelectedIndex(index);
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).kakao.maps.event.addListener(marker, 'mouseover', function() {
            displayInfowindow(marker, place.place_name);
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).kakao.maps.event.addListener(marker, 'mouseout', function() {
            infowindowRef.current?.close();
          });
        })(marker, places[i], i);

        newMarkers.push(marker);
        bounds.extend(position);
      }
    }

    setMarkers(newMarkers);
    
    // 검색된 장소 위치를 기준으로 지도 범위 재설정
    if (places.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any).setBounds(bounds);
    }
  }, [map, addMarker, displayInfowindow]);

  // 검색 결과 콜백
  const placesSearchCB = useCallback((data: SearchPlace[], status: string) => {
    setIsLoading(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (status === (window as any).kakao.maps.services.Status.OK) {
      setSearchResults(data);
      displayPlaces(data);
      showNotification(`${data.length}개의 장소를 찾았습니다.`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if (status === (window as any).kakao.maps.services.Status.ZERO_RESULT) {
      setSearchResults([]);
      showNotification('검색 결과가 없습니다.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if (status === (window as any).kakao.maps.services.Status.ERROR) {
      setSearchResults([]);
      showNotification('검색 중 오류가 발생했습니다.');
    }
  }, [showNotification, displayPlaces]);

  // 검색 실행
  useEffect(() => {
    if (!searchKeyword.trim() || !isVisible) {
      setSearchResults([]);
      removeMarkers();
      return;
    }

    setIsLoading(true);
    setSearchResults([]);
    removeMarkers();

    if (!psRef.current) return;

    // 키워드로 장소 검색
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (psRef.current as any).keywordSearch(searchKeyword, placesSearchCB);
  }, [searchKeyword, isVisible, placesSearchCB]);

  // 마커 제거
  const removeMarkers = () => {
    setMarkers(prevMarkers => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prevMarkers.forEach(marker => (marker as any).setMap(null));
      return [];
    });
    if (infowindowRef.current) {
      infowindowRef.current.close();
    }
  };

  // 검색 결과 항목 클릭 핸들러
  const handleItemClick = (place: SearchPlace, index: number) => {
    setSelectedIndex(index);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const position = new (window as any).kakao.maps.LatLng(place.y, place.x);
    
    // 해당 위치로 지도 이동
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (map as any).setCenter(position);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (map as any).setLevel(2);

    // 인포윈도우 표시
    if (markers[index]) {
      displayInfowindow(markers[index], place.place_name);
    }
  };

  // 컴포넌트 언마운트 시 마커 제거
  useEffect(() => {
    return () => {
      removeMarkers();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="flex-shrink-0 p-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">
          검색 결과 {searchResults.length > 0 && `(${searchResults.length}개)`}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          aria-label="검색 결과 닫기"
        >
          ×
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            검색 중...
          </div>
        )}

        {!isLoading && searchResults.length === 0 && searchKeyword && (
          <div className="p-4 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}

        {searchResults.map((place, index) => (
          <div
            key={`${place.place_name}-${index}`}
            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedIndex === index ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => handleItemClick(place, index)}
            onMouseEnter={() => {
              if (markers[index]) {
                displayInfowindow(markers[index], place.place_name);
              }
            }}
            onMouseLeave={() => {
              infowindowRef.current?.close();
            }}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                selectedIndex === index ? 'bg-blue-500' : 'bg-blue-400'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate" title={place.place_name}>
                  {place.place_name}
                </h4>
                <div className="mt-1 text-sm text-gray-600">
                  {place.road_address_name ? (
                    <div>
                      <div className="truncate" title={place.road_address_name}>
                        {place.road_address_name}
                      </div>
                      <div className="text-gray-500 text-xs truncate" title={place.address_name}>
                        (지번: {place.address_name})
                      </div>
                    </div>
                  ) : (
                    <div className="truncate" title={place.address_name}>
                      {place.address_name}
                    </div>
                  )}
                </div>
                {place.phone && (
                  <div className="mt-1 text-xs text-blue-600">
                    📞 {place.phone}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <a
                  href={place.place_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-xs"
                  onClick={(e) => e.stopPropagation()}
                  title="카카오맵에서 보기"
                >
                  🔗
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultList;
