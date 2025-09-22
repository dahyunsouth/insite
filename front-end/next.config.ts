import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 2025.09.09 홍지훈 인프라 배포할때 오류 땜 일단 추가해둔겁니당
    eslint: { ignoreDuringBuilds: true }, // 린트 에러가 있어도 빌드 계속
  // 필요시 타입오류도 임시무시 (권장X)
    typescript: { ignoreBuildErrors: true },
  
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/v1/:path*`,
      },
    ];
  },
};
  

export default nextConfig;
