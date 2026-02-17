/**
 * 개발 환경 전용 로거 유틸리티.
 *
 * - development: 모든 로그 출력
 * - production:  error, warn만 출력 (info/debug 무시)
 *
 * 사용법:
 *   import { logger } from '@/utils/logger';
 *   logger.info('[Context]', '메시지', data);
 *   logger.error('[Service]', '에러 발생', error);
 */

const isDev = process.env.NODE_ENV === 'development';

/* eslint-disable no-console */
export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
/* eslint-enable no-console */
