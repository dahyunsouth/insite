/**
 * 서울 열린데이터광장 API 응답 공통 타입.
 *
 * 대부분의 Seoul API Route Handler에서 공유하는 패턴:
 * - Object.values(data).find(v => "RESULT" in v) 로 루트 추출
 * - root.row 에서 데이터 행 배열
 * - root.RESULT.CODE === "INFO-000" 이면 정상
 */

/** API 응답에서 추출한 루트 객체 */
export interface SeoulApiRoot {
  RESULT?: {
    CODE?: string;
    MESSAGE?: string;
  };
  row?: SeoulApiRow[];
  list_total_count?: number;
}

/** 데이터 행 - 동적 키를 가진 레코드 */
export type SeoulApiRow = Record<string, string | number | null | undefined>;

/** Object.values(data) 에서 루트를 찾는 타입 가드 */
export function isSeoulApiRoot(v: unknown): v is SeoulApiRoot {
  return v !== null && typeof v === 'object' && 'RESULT' in (v as Record<string, unknown>);
}
