import { NextRequest } from "next/server";

const SEOUL_BASE = "http://openapi.seoul.go.kr:8088";
// Store stats by quarter per trade area
const SERVICE = "VwsmTrdarStorQq";

function getApiKey() {
  const key = process.env.SEOUL_OPENAPI_KEY;
  if (!key) throw new Error("SEOUL_OPENAPI_KEY is not set");
  return key;
}

async function fetchPage(key: string, quarter: string, start: number, end: number) {
  const url = `${SEOUL_BASE}/${key}/json/${SERVICE}/${start}/${end}/${quarter}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { ok: false as const, status: res.status };
  const data = await res.json().catch(() => ({}));
  const root = Object.values(data).find(
    (v: any) => v && typeof v === "object" && "RESULT" in v
  ) as any;
  const code = root?.RESULT?.CODE as string | undefined;
  if (code !== "INFO-000") {
    return { ok: false as const, status: code === "INFO-200" ? 404 : code?.startsWith("ERROR-5") ? 502 : 400, code, message: root?.RESULT?.MESSAGE };
  }
  const total = Number(root?.list_total_count ?? 0);
  const rows: any[] = Array.isArray(root?.row) ? root.row : [];
  return { ok: true as const, total, rows };
}

type Acc = {
  store: number; // STOR_CO
  similar: number; // SIMILR_INDUTY_STOR_CO
  openCount: number; // OPBIZ_STOR_CO
  closeCount: number; // CLSBIZ_STOR_CO
  trdarNm: string;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const quarter = searchParams.get("quarter");
    const trdar = searchParams.get("trdar");
    const svc = searchParams.get("svc") ?? "CS100010"; // default to requested code
    if (!quarter || !trdar) return new Response(JSON.stringify({ error: "Missing quarter or trdar" }), { status: 400 });

    const key = getApiKey();

    // Probe total to page through
    const probe = await fetchPage(key, quarter, 1, 1);
    if (!probe.ok) return new Response(JSON.stringify({ error: probe.code ?? "Upstream error" }), { status: probe.status });
    const total = probe.total;
    const pageSize = 1000;
    const pages = Math.max(1, Math.ceil(total / pageSize));

    let acc: Acc | null = null;

    for (let p = 0; p < pages; p++) {
      const start = p * pageSize + 1;
      const end = Math.min(total, (p + 1) * pageSize);
      const r = await fetchPage(key, quarter, start, end);
      if (!r.ok) return new Response(JSON.stringify({ error: r.code ?? "Upstream error" }), { status: r.status });
      const filtered = r.rows.filter(
        (row) => String(row?.TRDAR_CD) === String(trdar) && (!svc || String(row?.SVC_INDUTY_CD) === String(svc))
      );
      for (const row of filtered) {
        const store = Number(row?.STOR_CO ?? 0);
        const similar = Number(row?.SIMILR_INDUTY_STOR_CO ?? 0);
        const openCount = Number(row?.OPBIZ_STOR_CO ?? 0);
        const closeCount = Number(row?.CLSBIZ_STOR_CO ?? 0);
        const trdarNm = String(row?.TRDAR_CD_NM ?? "");
        if (!acc) acc = { store: 0, similar: 0, openCount: 0, closeCount: 0, trdarNm };
        acc.store += store;
        acc.similar += similar;
        acc.openCount += openCount;
        acc.closeCount += closeCount;
        if (!acc.trdarNm && trdarNm) acc.trdarNm = trdarNm;
      }
    }

    if (!acc) {
      return new Response(JSON.stringify({ error: "Trade area not found in quarter", quarter, trdar }), { status: 404 });
    }

    const openRate = acc.store > 0 ? (acc.openCount / acc.store) * 100 : 0;
    const closeRate = acc.store > 0 ? (acc.closeCount / acc.store) * 100 : 0;
    const netChange = acc.openCount - acc.closeCount;

    const body = {
      quarter,
      trdarCd: String(trdar),
      trdarNm: acc.trdarNm,
      storeCount: acc.store,
      similarIndustryStoreCount: acc.similar,
      openRate,
      openStoreCount: acc.openCount,
      closeRate,
      closeStoreCount: acc.closeCount,
      netChange,
    };

    return new Response(JSON.stringify(body), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=2592000",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Server error" }), { status: 500 });
  }
}
