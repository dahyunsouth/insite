export interface RecommendationItem {
  ranking: number;
  areaName: string;
  totalScore: number;
  sustainabilityScore: number;
  profitabilityScore: number;
  accessibilityScore: number;
  riskScore: number;
  competitionScore: number;
  trdarCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface RecommendationResponse {
  district: string;
  areaType: string;
  items: RecommendationItem[];
}

export interface BaseApiResponse<T> {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: T;
}
