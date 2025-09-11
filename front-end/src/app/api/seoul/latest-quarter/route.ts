import { NextRequest } from "next/server";

const SEOUL_BASE = "http://openapi.seoul.go.kr:8088";
// Correct service name per official spec/sample
const SERVICE = "VwsmTrdarFlpopQq";

function getApiKey() {
  const key = process.env.SEOUL_OPENAPI_KEY;
  if (!key) throw new Error("SEOUL_OPENAPI_KEY is not set");
  return key;
}

function quarterCodeForDate(d: Date) {
  const month = d.getMonth(); // 0-11
  const q = Math.floor(month / 3) + 1; // 1-4
  const year = d.getFullYear();
  return `${year}${q}`;
}

function generateQuarterCandidates(limit = 12): string[] {
  const now = new Date();
  // Start from current quarter and go back `limit` quarters
  let year = now.getFullYear();
  let q = Math.floor(now.getMonth() / 3) + 1;
  const out: string[] = [];
  for (let i = 0; i < limit; i++) {
    out.push(`${year}${q}`);
    q -= 1;
    if (q === 0) {
      q = 4;
      year -= 1;
    }
  }
  return out;
}

async function probeQuarter(quarter: string) {
  const key = getApiKey();
  const url = `${SEOUL_BASE}/${key}/json/${SERVICE}/1/1/${quarter}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return { ok: false, status: res.status } as const;
  }
  const data = await res.json().catch(() => ({}));
  // The root key can vary; try to find the object that contains RESULT
  const root = Object.values(data).find(
    (v: any) => v && typeof v === "object" && "RESULT" in v
  ) as any;
  const code = root?.RESULT?.CODE as string | undefined;
  const total = root?.list_total_count as number | undefined;
  if (code === "INFO-000") return { ok: true as const, total: total ?? 0 };
  if (code === "INFO-200") return { ok: false as const, status: 204 };
  // Treat upstream server/database errors as 5xx
  if (code?.startsWith("ERROR-5") || code?.startsWith("ERROR-6")) {
    return { ok: false as const, status: 502 };
  }
  // Other errors (invalid params, key, etc.) -> 400-ish
  return { ok: false as const, status: 400, code };
}

export async function GET(_req: NextRequest) {
  try {
    // Fail fast when key missing (avoid 404)
    getApiKey();
    const candidates = generateQuarterCandidates(40);
    let sawUpstreamFailure = false;
    for (const quarter of candidates) {
      try {
        const r = await probeQuarter(quarter);
        if (r.ok) {
          const body = JSON.stringify({ quarter, list_total_count: r.total });
          return new Response(body, {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              // Cache 6h, serve stale for 30d while revalidating
              "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=2592000",
            },
          });
        }
        if (r.status >= 500) sawUpstreamFailure = true;
      } catch {
        // ignore and try previous quarter
      }
    }
    const status = sawUpstreamFailure ? 502 : 404;
    const msg = sawUpstreamFailure ? "Upstream unavailable or failing for recent quarters" : "No valid quarter found";
    return new Response(JSON.stringify({ error: msg, tried: candidates }), { status });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message ?? "Server error" }),
      { status: 500 }
    );
  }
}
