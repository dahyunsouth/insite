# Next.js SSR용 — Debian slim 권장 (sharp 등 네이티브 모듈 호환 좋음)
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 🔐 (추가) Jenkins --build-arg로 전달된 공개 키를 "빌드 시점"에만 주입
#     - Jenkins 파이프라인에서: docker build ... --build-arg NEXT_PUBLIC_KAKAO_MAP_API_KEY=...
ARG NEXT_PUBLIC_KAKAO_MAP_API_KEY
ENV NEXT_PUBLIC_KAKAO_MAP_API_KEY=${NEXT_PUBLIC_KAKAO_MAP_API_KEY}

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 프로덕션 의존성만 별도 준비
FROM node:20-bookworm-slim AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# 런타임
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# 프로덕션 node_modules만 복사
COPY --from=prod-deps /app/node_modules ./node_modules
# 빌드 결과/정적 리소스/패키지 메타 복사
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./

EXPOSE 3000
# (선택) /healthz 라우트를 만들어뒀다면 유용
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD node -e "require('http').get('http://127.0.0.1:3000/healthz', r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["npm","run","start","--","-p","3000"]