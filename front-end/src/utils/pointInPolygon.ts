/**
 * Point-in-Polygon 알고리즘을 사용하여 좌표가 폴리곤 내부에 있는지 확인
 * Ray Casting 알고리즘 사용
 */

export interface Point {
  lat: number;
  lng: number;
}

export interface PolygonPath {
  lat: number;
  lng: number;
}

/**
 * 점이 폴리곤 내부에 있는지 확인하는 함수
 * @param point 확인할 점의 좌표
 * @param polygon 폴리곤의 꼭짓점들
 * @returns 점이 폴리곤 내부에 있으면 true, 아니면 false
 */
export function isPointInPolygon(point: Point, polygon: PolygonPath[]): boolean {
  const { lat, lng } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * 카카오맵 LatLng 객체 배열을 Point 배열로 변환
 * @param kakaoLatLngs 카카오맵 LatLng 객체 배열
 * @returns Point 배열
 */
export function convertKakaoLatLngsToPoints(kakaoLatLngs: any[]): PolygonPath[] {
  return kakaoLatLngs.map((latLng: any) => ({
    lat: latLng.getLat(),
    lng: latLng.getLng()
  }));
}

/**
 * 여러 폴리곤 중에서 점이 포함된 폴리곤을 찾는 함수
 * @param point 확인할 점의 좌표
 * @param polygons 폴리곤들의 배열
 * @returns 점이 포함된 폴리곤의 인덱스, 없으면 -1
 */
export function findContainingPolygon(point: Point, polygons: PolygonPath[][]): number {
  for (let i = 0; i < polygons.length; i++) {
    if (isPointInPolygon(point, polygons[i])) {
      return i;
    }
  }
  return -1;
}
