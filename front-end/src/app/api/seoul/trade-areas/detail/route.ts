import { NextRequest } from "next/server";

const SEOUL_BASE = "http://openapi.seoul.go.kr:8088";
const SERVICE = "VwsmTrdarFlpopQq"; // confirmed correct service name

function getApiKey() {
  const key = process.env.SEOUL_OPENAPI_KEY;
  if (!key) throw new Error("SEOUL_OPENAPI_KEY is not set");
  return key;
}

type Slot = { key: string; label: string; value: number };

function mapSlots(row: any): Slot[] {
  const items: Array<[string, string]> = [
    ["TMZON_00_06_FLPOP_CO", "00–06시"],
    ["TMZON_06_11_FLPOP_CO", "06–11시"],
    ["TMZON_11_14_FLPOP_CO", "11–14시"],
    ["TMZON_14_17_FLPOP_CO", "14–17시"],
    ["TMZON_17_21_FLPOP_CO", "17–21시"],
    ["TMZON_21_24_FLPOP_CO", "21–24시"],
  ];
  return items.map(([key, label]) => ({ key, label, value: Number(row?.[key] ?? 0) }));
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
    return { ok: false as const, status: code?.startsWith("ERROR-5") ? 502 : 400, code, message: root?.RESULT?.MESSAGE };
  }
  const total = Number(root?.list_total_count ?? 0);
  const rows: any[] = Array.isArray(root?.row) ? root.row : [];
  return { ok: true as const, total, rows };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const quarter = searchParams.get("quarter");
    const trdar = searchParams.get("trdar");
    if (!quarter || !trdar) return new Response(JSON.stringify({ error: "Missing quarter or trdar" }), { status: 400 });

    const key = getApiKey();

    // Get total count with a cheap probe (1 item) to derive page count
    const probe = await fetchPage(key, quarter, 1, 1);
    if (!probe.ok) return new Response(JSON.stringify({ error: probe.code ?? "Upstream error" }), { status: probe.status });
    const total = probe.total;
    const pageSize = 1000;
    const pages = Math.max(1, Math.ceil(total / pageSize));

    // Search page by page until found
    for (let p = 0; p < pages; p++) {
      const start = p * pageSize + 1;
      const end = Math.min(total, (p + 1) * pageSize);
      const r = await fetchPage(key, quarter, start, end);
      if (!r.ok) return new Response(JSON.stringify({ error: r.code ?? "Upstream error" }), { status: r.status });
      const found = r.rows.find((row) => String(row?.TRDAR_CD) === String(trdar));
      if (found) {
        const slots = mapSlots(found);
        let maxIndex = 0;
        for (let i = 1; i < slots.length; i++) if (slots[i].value > slots[maxIndex].value) maxIndex = i;
        const result = {
          quarter,
          trdarCd: String(found.TRDAR_CD),
          trdarNm: String(found.TRDAR_CD_NM ?? ""),
          slots,
          max: { index: maxIndex, label: slots[maxIndex].label, value: slots[maxIndex].value },
          list_total_count: total,
        };
        return new Response(JSON.stringify(result), {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=2592000",
          },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Trade area not found in quarter", quarter, trdar }), { status: 404 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Server error" }), { status: 500 });
  }
}

