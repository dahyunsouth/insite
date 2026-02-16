// 공통 응답 래퍼 + 간이 JWT 유틸리티

export function successResponse(result: unknown, message = "성공") {
  return Response.json(
    { httpStatus: "OK", isSuccess: true, message, code: 200, result },
    { status: 200 }
  );
}

export function errorResponse(
  message: string,
  status = 400,
  code?: number
) {
  return Response.json(
    {
      httpStatus: status >= 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST",
      isSuccess: false,
      message,
      code: code ?? status,
      result: null,
    },
    { status }
  );
}

// --- 간이 JWT (암호화 불필요, 구조만 유지) ---

const SECRET = "mock-secret";

/** 비ASCII 문자를 \uXXXX 이스케이프로 변환하여 btoa 호환 문자열 생성 */
function toAsciiJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/[\u0080-\uffff]/g, (ch) =>
    "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0")
  );
}

export function createToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = btoa(
    toAsciiJson({
      sub: payload.uuid,          // jwt.ts의 JwtPayload가 sub 필드를 기대
      ...payload,
      iat: Date.now(),
      exp: Date.now() + 3600000,
    })
  );
  const sig = btoa(SECRET);
  return `${header}.${body}.${sig}`;
}

export function parseToken(
  authHeader: string | null
): Record<string, unknown> | null {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "");
  try {
    const [, body] = token.split(".");
    return JSON.parse(atob(body));
  } catch {
    return null;
  }
}
