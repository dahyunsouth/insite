// 시드 기반 결정적 데이터 생성 유틸리티

/** 간단한 시드 해시 (결정적) */
export function hash(seed: number, salt = 0): number {
  let h = ((seed + salt) * 2654435761) >>> 0;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  return ((h >>> 16) ^ h) >>> 0;
}

/** seed 기반 범위 내 정수 */
export function randInt(seed: number, min: number, max: number, salt = 0): number {
  const lo = Math.round(min);
  const hi = Math.round(max);
  return lo + (hash(seed, salt) % (hi - lo + 1));
}

/** seed 기반 배열 요소 선택 */
export function pick<T>(seed: number, arr: T[], salt = 0): T {
  return arr[hash(seed, salt) % arr.length];
}

export const QUARTER = "20244";
