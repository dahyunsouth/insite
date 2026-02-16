// 배럴 re-export — 기존 import 경로 유지
// import { ... } from "../../_mock/generators" 그대로 사용 가능

export {
  getGuList,
  getDongList,
  getTradeAreas,
  countByGu,
  countByDong,
} from "./trade-areas";

export {
  generateTradeAreaDetail,
  generateScore,
  generateRecommendations,
  generateAiSummary,
} from "./gen-detail";

export {
  generateSalesInfo,
  generateStorInfo,
  generateChngeIx,
  generateFlpop,
  generateRepop,
  generateWrcPopltn,
} from "./gen-info";
