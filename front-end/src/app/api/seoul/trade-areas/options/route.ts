import { NextRequest } from "next/server";

const SEOUL_BASE = "http://openapi.seoul.go.kr:8088";
// Correct service name per official spec/sample
const SERVICE = "VwsmTrdarFlpopQq";

function getApiKey() {
  const key = process.env.SEOUL_OPENAPI_KEY;
  if (!key) throw new Error("SEOUL_OPENAPI_KEY is not set");
  return key;
}

function clampRange(start: number, end: number) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) return { start: 1, end: 1000 };
  if (start < 1) start = 1;
  if (end < start) end = start;
  const size = end - start + 1;
  if (size > 1000) end = start + 1000 - 1; // API hard limit
  return { start, end };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const quarter = searchParams.get("quarter");
    const start = Number(searchParams.get("start") ?? "1");
    const end = Number(searchParams.get("end") ?? "1000");
    if (!quarter) return new Response(JSON.stringify({ error: "Missing quarter" }), { status: 400 });

    const range = clampRange(start, end);
    const key = getApiKey();
    const url = `${SEOUL_BASE}/${key}/json/${SERVICE}/${range.start}/${range.end}/${quarter}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return new Response(JSON.stringify({ error: `Upstream ${res.status}` }), { status: 502 });
    const data = await res.json().catch(() => ({}));
    const root = Object.values(data).find(
      (v: any) => v && typeof v === "object" && "RESULT" in v
    ) as any;
    const code = root?.RESULT?.CODE as string | undefined;
    if (code === "INFO-200") {
      return new Response(JSON.stringify({ quarter, total: 0, items: [], hasMore: false }), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // short negative cache
        },
      });
    }
    if (code !== "INFO-000") {
      return new Response(JSON.stringify({ error: root?.RESULT?.MESSAGE ?? "Upstream error", code }), { status: 400 });
    }

    const total = Number(root?.list_total_count ?? 0);
    const rows: any[] = Array.isArray(root?.row) ? root.row : [];
    const map = new Map<string, { code: string; name: string }>();
    for (const r of rows) {
      const codeVal = String(r?.TRDAR_CD ?? "");
      const nameVal = String(r?.TRDAR_CD_NM ?? "");
      if (!codeVal || !nameVal) continue;
      if (!map.has(codeVal)) map.set(codeVal, { code: codeVal, name: nameVal });
    }
    const items = Array.from(map.values());
    const hasMore = range.end < total;
    return new Response(
      JSON.stringify({ quarter, total, range, items, hasMore }),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          // Quarter data is immutable: cache for 24h and allow long stale serving
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=2592000",
        },
      }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Server error" }), { status: 500 });
  }
}
