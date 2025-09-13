import { NextRequest } from "next/server";

const SEOUL_BASE = "http://openapi.seoul.go.kr:8088";
// Worker population by quarter per trade area
const SERVICE = "VwsmTrdarWrcPopltnQq";

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
    return {
      ok: false as const,
      status: code === "INFO-200" ? 404 : code?.startsWith("ERROR-5") ? 502 : 400,
      code,
      message: root?.RESULT?.MESSAGE,
    };
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
    if (!quarter || !trdar)
      return new Response(
        JSON.stringify({ error: "Missing quarter or trdar" }),
        { status: 400 }
      );

    const key = getApiKey();

    // Probe total to determine pagination
    const probe = await fetchPage(key, quarter, 1, 1);
    if (!probe.ok)
      return new Response(
        JSON.stringify({ error: probe.code ?? "Upstream error", message: (probe as any).message }),
        { status: probe.status }
      );

    const total = probe.total;
    const pageSize = 1000;
    const pages = Math.max(1, Math.ceil(total / pageSize));

    let found: any | null = null;

    for (let p = 0; p < pages && !found; p++) {
      const start = p * pageSize + 1;
      const end = Math.min(total, (p + 1) * pageSize);
      const r = await fetchPage(key, quarter, start, end);
      if (!r.ok)
        return new Response(
          JSON.stringify({ error: r.code ?? "Upstream error", message: (r as any).message }),
          { status: r.status }
        );
      found = r.rows.find((row) => String(row?.TRDAR_CD) === String(trdar)) ?? null;
    }

    if (!found) {
      return new Response(
        JSON.stringify({ error: "Trade area not found in quarter", quarter, trdar }),
        { status: 404 }
      );
    }

    // Extract fields safely
    const trdarNm = String(found?.TRDAR_CD_NM ?? "");
    const totalWorkers = Number(found?.TOT_WRC_POPLTN_CO ?? 0);
    const male = Number(found?.ML_WRC_POPLTN_CO ?? 0);
    const female = Number(found?.FML_WRC_POPLTN_CO ?? 0);

    const age10 = Number(found?.AGRDE_10_WRC_POPLTN_CO ?? 0);
    const age20 = Number(found?.AGRDE_20_WRC_POPLTN_CO ?? 0);
    const age30 = Number(found?.AGRDE_30_WRC_POPLTN_CO ?? 0);
    const age40 = Number(found?.AGRDE_40_WRC_POPLTN_CO ?? 0);
    const age50 = Number(found?.AGRDE_50_WRC_POPLTN_CO ?? 0);
    const age60 = Number(found?.AGRDE_60_ABOVE_WRC_POPLTN_CO ?? 0);

    const maleRate = totalWorkers > 0 ? (male / totalWorkers) * 100 : 0;
    const femaleRate = totalWorkers > 0 ? (female / totalWorkers) * 100 : 0;

    const ages = [
      { key: "10", value: age10 },
      { key: "20", value: age20 },
      { key: "30", value: age30 },
      { key: "40", value: age40 },
      { key: "50", value: age50 },
      { key: "60+", value: age60 },
    ];
    let topAgeIndex = 0;
    for (let i = 1; i < ages.length; i++) if (ages[i].value > ages[topAgeIndex].value) topAgeIndex = i;
    const topAge = ages[topAgeIndex];
    const topAgeRate = totalWorkers > 0 ? (topAge.value / totalWorkers) * 100 : 0;

    const body = {
      quarter,
      trdarCd: String(trdar),
      trdarNm,
      totalWorkers,
      male,
      female,
      maleRate,
      femaleRate,
      age: {
        "10": age10,
        "20": age20,
        "30": age30,
        "40": age40,
        "50": age50,
        "60+": age60,
      },
      topAgeGroup: { key: topAge.key, value: topAge.value, rate: topAgeRate },
    };

    return new Response(JSON.stringify(body), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // Quarter data is immutable; cache generously
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=2592000",
      },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message ?? "Server error" }),
      { status: 500 }
    );
  }
}

