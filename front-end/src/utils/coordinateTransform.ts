// TM 좌표계를 WGS84로 변환하는 유틸리티 함수
// 한국 중부원점 기준 (EPSG:2097 -> EPSG:4326)

/**
 * TM 좌표계를 WGS84 좌표계로 변환
 * @param tmX TM X 좌표 (동서방향)
 * @param tmY TM Y 좌표 (남북방향)
 * @returns {lat: number, lng: number} WGS84 좌표
 */
export function tmToWgs84(tmX: number, tmY: number): { lat: number; lng: number } {
  // 한국 중부원점 TM 좌표계 파라미터
  const a = 6378137.0; // 장반경 (WGS84)
  const f = 1 / 298.257223563; // 편평률
  const e2 = 2 * f - f * f; // 제1이심률의 제곱
  const e = Math.sqrt(e2);
  
  // 중부원점 기준
  const lon0 = 127.0 * Math.PI / 180; // 중앙경선 (127도)
  const lat0 = 38.0 * Math.PI / 180; // 원점위도 (38도)
  const k0 = 1.0; // 축척계수
  const x0 = 200000.0; // 동쪽 이동값
  const y0 = 500000.0; // 북쪽 이동값
  
  // TM 좌표에서 원점 이동값 제거
  const x = tmX - x0;
  const y = tmY - y0;
  
  // M0 계산 (원점에서의 자오선 호장)
  const M0 = a * ((1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256) * lat0
    - (3*e2/8 + 3*e2*e2/32 + 45*e2*e2*e2/1024) * Math.sin(2*lat0)
    + (15*e2*e2/256 + 45*e2*e2*e2/1024) * Math.sin(4*lat0)
    - (35*e2*e2*e2/3072) * Math.sin(6*lat0));
  
  // M 계산
  const M = M0 + y / k0;
  
  // μ 계산 (보정위도)
  const mu = M / (a * (1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256));
  
  // e1 계산
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  
  // φ1 계산 (보정위도에서 위도로 변환)
  const phi1 = mu + (3*e1/2 - 27*e1*e1*e1/32) * Math.sin(2*mu)
    + (21*e1*e1/16 - 55*e1*e1*e1*e1/32) * Math.sin(4*mu)
    + (151*e1*e1*e1/96) * Math.sin(6*mu);
  
  // 보조 계산
  const sin_phi1 = Math.sin(phi1);
  const cos_phi1 = Math.cos(phi1);
  const tan_phi1 = Math.tan(phi1);
  
  const C1 = e2 * cos_phi1 * cos_phi1 / (1 - e2);
  const T1 = tan_phi1 * tan_phi1;
  const N1 = a / Math.sqrt(1 - e2 * sin_phi1 * sin_phi1);
  const R1 = a * (1 - e2) / Math.pow(1 - e2 * sin_phi1 * sin_phi1, 1.5);
  const D = x / (N1 * k0);
  
  // 위도 계산
  const lat = phi1 - (N1 * tan_phi1 / R1) * (D*D/2 - (5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*e2) * D*D*D*D/24
    + (61 + 90*T1 + 298*C1 + 45*T1*T1 - 252*e2 - 3*C1*C1) * D*D*D*D*D*D/720);
  
  // 경도 계산
  const lng = lon0 + (D - (1 + 2*T1 + C1) * D*D*D/6 + (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*e2 + 24*T1*T1) * D*D*D*D*D/120) / cos_phi1;
  
  return {
    lat: lat * 180 / Math.PI, // 라디안을 도로 변환
    lng: lng * 180 / Math.PI  // 라디안을 도로 변환
  };
}

/**
 * 간단한 근사 변환 (기존 방식 - 빠르지만 부정확)
 * @param tmX TM X 좌표
 * @param tmY TM Y 좌표
 * @returns {lat: number, lng: number} WGS84 좌표
 */
export function tmToWgs84Simple(tmX: number, tmY: number): { lat: number; lng: number } {
  // 서울 지역 기준 근사 변환
  const lng = 126.978 + (tmX - 197000) * 0.0000089;
  const lat = 37.5665 + (tmY - 452000) * 0.0000111;
  
  return { lat, lng };
}
