/**
 * Kakao Maps SDK 타입 정의.
 *
 * 프로젝트에서 실제 사용하는 API만 정의합니다.
 * 참고: https://apis.map.kakao.com/web/documentation/

*
 * 이 파일은 ambient declaration (스크립트 모드)이므로
 * `declare namespace kakao.maps`가 전역으로 노출됩니다.
 * `export` 키워드를 추가하면 모듈로 전환되어 전역 노출이 해제되므로 주의하세요.
 */

declare namespace kakao.maps {
  /** 위도·경도 좌표 */
  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  /** 좌표 영역(bounds) */
  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(latlng: LatLng): void;
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
  }

  /** 크기 */
  class Size {
    constructor(width: number, height: number);
  }

  /** 좌표(점) */
  class Point {
    constructor(x: number, y: number);
  }

  /** 지도 옵션 */
  interface MapOptions {
    center: LatLng;
    level?: number;
    mapTypeId?: MapTypeId;
  }

  /** 지도 */
  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    getCenter(): LatLng;
    setLevel(level: number, options?: { animate?: boolean; duration?: number; easing?: string }): void;
    getLevel(): number;
    setMapTypeId(typeId: MapTypeId): void;
    getBounds(): LatLngBounds;
    setBounds(bounds: LatLngBounds): void;
    addControl(control: MapTypeControl, position: ControlPosition): void;
    removeControl(control: MapTypeControl): void;
    addOverlayMapTypeId(type: MapTypeId): void;
    removeOverlayMapTypeId(type: MapTypeId): void;
    relayout(): void;
  }

  /** 마커 이미지 옵션 */
  interface MarkerImageOptions {
    spriteSize?: Size;
    spriteOrigin?: Point;
    offset?: Point;
  }

  /** 마커 이미지 */
  class MarkerImage {
    constructor(src: string, size: Size, options?: MarkerImageOptions);
  }

  /** 마커 옵션 */
  interface MarkerOptions {
    position: LatLng;
    map?: Map;
    image?: MarkerImage;
    draggable?: boolean;
  }

  /** 마커 */
  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getMap(): Map | null;
    setPosition(position: LatLng): void;
    getPosition(): LatLng;
    setImage(image: MarkerImage): void;
  }

  /** 인포윈도우 옵션 */
  interface InfoWindowOptions {
    content?: string | HTMLElement;
    position?: LatLng;
    zIndex?: number;
    removable?: boolean;
  }

  /** 인포윈도우 */
  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    open(map: Map, marker?: Marker): void;
    close(): void;
    setContent(content: string | HTMLElement): void;
  }

  /** 커스텀 오버레이 옵션 */
  interface CustomOverlayOptions {
    position?: LatLng;
    content?: string | HTMLElement;
    map?: Map;
    yAnchor?: number;
    zIndex?: number;
    clickable?: boolean;
  }

  /** 커스텀 오버레이 */
  class CustomOverlay {
    constructor(options?: CustomOverlayOptions);
    setMap(map: Map | null): void;
    setPosition(position: LatLng): void;
    setContent(content: string | HTMLElement): void;
    setZIndex(zIndex: number): void;
    getContent(): string | HTMLElement;
  }

  /** 폴리곤 옵션 */
  interface PolygonOptions {
    path: LatLng[] | LatLng[][];
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeStyle?: string;
    fillColor?: string;
    fillOpacity?: number;
    zIndex?: number;
    clickable?: boolean;
  }

  /** 폴리곤 */
  class Polygon {
    constructor(options: PolygonOptions);
    setMap(map: Map | null): void;
    setOptions(options: Partial<PolygonOptions>): void;
    getPath(): LatLng[];
  }

  /** 지도 타입 ID */
  enum MapTypeId {
    ROADMAP = 1,
    SKYVIEW = 2,
    HYBRID = 3,
    ROADVIEW = 4,
  }

  /** 컨트롤 위치 */
  enum ControlPosition {
    TOP = 0,
    TOPLEFT = 1,
    TOPRIGHT = 2,
    BOTTOMLEFT = 3,
    BOTTOM = 4,
    BOTTOMRIGHT = 5,
    LEFT = 6,
    RIGHT = 7,
  }

  /** 지도 타입 컨트롤 */
  class MapTypeControl {}

  /** 로드뷰 */
  class Roadview {
    constructor(container: HTMLElement);
    setPanoId(panoId: string, position: LatLng): void;
    getPosition(): LatLng;
  }

  /** 로드뷰 클라이언트 */
  class RoadviewClient {
    getNearestPanoId(
      position: LatLng,
      radius: number,
      callback: (panoId: string | null) => void,
    ): void;
  }

  /** 이벤트 유틸리티 */
  namespace event {
    function addListener(
      target: Map | Marker | Polygon | Roadview,
      type: string,
      handler: (...args: unknown[]) => void,
    ): void;
    function removeListener(
      target: Map | Marker | Polygon | Roadview,
      type: string,
      handler: (...args: unknown[]) => void,
    ): void;
    function preventMap(): void;
  }

  /** Places 서비스 */
  namespace services {
    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR',
    }

    interface PlacesSearchResult {
      place_name: string;
      address_name: string;
      road_address_name: string;
      phone: string;
      place_url: string;
      x: string;
      y: string;
      category_name: string;
      category_group_code: string;
      category_group_name: string;
      id: string;
    }

    interface GeocoderResult {
      address: {
        address_name: string;
        region_1depth_name: string;
        region_2depth_name: string;
        region_3depth_name: string;
      };
    }

    class Places {
      constructor(map?: Map);
      categorySearch(
        code: string,
        callback: (
          result: PlacesSearchResult[],
          status: Status,
          pagination: unknown,
        ) => void,
        options?: {
          location?: LatLng;
          radius?: number;
          bounds?: LatLngBounds;
          useMapBounds?: boolean;
          useMapCenter?: boolean;
          size?: number;
          page?: number;
        },
      ): void;
      keywordSearch(
        keyword: string,
        callback: (
          result: PlacesSearchResult[],
          status: Status,
          pagination: unknown,
        ) => void,
        options?: {
          location?: LatLng;
          radius?: number;
          bounds?: LatLngBounds;
          category_group_code?: string;
          useMapBounds?: boolean;
          useMapCenter?: boolean;
          size?: number;
          page?: number;
        },
      ): void;
    }

    class Geocoder {
      coord2Address(
        lng: number,
        lat: number,
        callback: (result: GeocoderResult[], status: Status) => void,
      ): void;
      coord2RegionCode(
        lng: number,
        lat: number,
        callback: (result: GeocoderResult[], status: Status) => void,
      ): void;
    }
  }

  /** SDK 로드 완료 후 콜백 */
  function load(callback: () => void): void;
}

/** Window 전역 인터페이스 확장 */
interface Window {
  kakao: {
    maps: typeof kakao.maps & {
      load: typeof kakao.maps.load;
      LatLng: typeof kakao.maps.LatLng;
      LatLngBounds: typeof kakao.maps.LatLngBounds;
      Map: typeof kakao.maps.Map;
      Marker: typeof kakao.maps.Marker;
      MarkerImage: typeof kakao.maps.MarkerImage;
      InfoWindow: typeof kakao.maps.InfoWindow;
      CustomOverlay: typeof kakao.maps.CustomOverlay;
      Polygon: typeof kakao.maps.Polygon;
      Size: typeof kakao.maps.Size;
      Point: typeof kakao.maps.Point;
      Roadview: typeof kakao.maps.Roadview;
      RoadviewClient: typeof kakao.maps.RoadviewClient;
      MapTypeId: typeof kakao.maps.MapTypeId;
      MapTypeControl: typeof kakao.maps.MapTypeControl;
      ControlPosition: typeof kakao.maps.ControlPosition;
      event: typeof kakao.maps.event;
      services: {
        Places: typeof kakao.maps.services.Places;
        Geocoder: typeof kakao.maps.services.Geocoder;
        Status: typeof kakao.maps.services.Status;
      };
    };
  };
}
