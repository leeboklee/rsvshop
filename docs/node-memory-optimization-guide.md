# Node.js 메모리 최적화 가이드

## 현재 프로젝트 메모리 사용량 분석

### 1. 메모리 사용량 현황
- **현재 사용량**: ~43MB (node.exe 프로세스)
- **일반적인 Next.js 앱**: 50-100MB
- **문제점**: 개발 환경에서 과도한 메모리 사용

### 2. 메모리 사용량이 높은 원인

#### A. Next.js 개발 서버 특성
```javascript
// 문제가 되는 요소들
- Hot Module Replacement (HMR)
- 파일 시스템 감시 (File Watcher)
- 소스맵 생성
- 개발용 번들링
- TypeScript 컴파일러
```

#### B. 프로젝트 구조적 문제
```javascript
// 현재 프로젝트의 문제점
- 많은 API 라우트 (10+ 개)
- 복잡한 Prisma 스키마
- 대용량 로그 파일들 (logs/ 디렉토리)
- 실시간 데이터 처리
- 메모리 누수 가능성
```

## 메모리 최적화 전략

### 1. 즉시 적용 가능한 최적화

#### A. Next.js 설정 최적화
```javascript
// next.config.js
module.exports = {
  // 메모리 사용량 최적화
  experimental: {
    optimizeCss: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // 번들 크기 최적화
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  
  // 개발 서버 최적화
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
}
```

#### B. 환경 변수 최적화
```bash
# .env.local
NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=development
```

#### C. package.json 스크립트 최적화
```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=512' next dev -p 3900",
    "dev:light": "NODE_OPTIONS='--max-old-space-size=256 --optimize-for-size' next dev -p 3900",
    "build": "NODE_OPTIONS='--max-old-space-size=1024' next build",
    "start": "NODE_OPTIONS='--max-old-space-size=512' next start -p 3900"
  }
}
```

### 2. 코드 레벨 최적화

#### A. 메모리 누수 방지
```typescript
// app/lib/prisma.ts - 연결 풀 최적화
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // 연결 풀 최적화
  __internal: {
    engine: {
      connectionLimit: 5,
      pool: {
        min: 0,
        max: 10,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 30000,
      },
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### B. API 라우트 최적화
```typescript
// app/api/admin/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// 메모리 효율적인 데이터 처리
export async function GET(request: NextRequest) {
  try {
    // 페이지네이션 적용
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 필요한 필드만 선택
    const bookings = await prisma.booking.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        status: true,
        checkInDate: true,
        checkOutDate: true,
        totalAmount: true,
        room: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
```

#### C. 컴포넌트 최적화
```typescript
// app/admin/reservations/page.tsx
import { memo, useMemo, useCallback } from 'react';

// 메모이제이션을 통한 불필요한 리렌더링 방지
const StatsCard = memo(({ title, value, color }: any) => (
  <div className={`bg-gradient-to-br from-${color}-500 to-${color}-600 p-6 rounded-2xl shadow-xl text-white`}>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className={`text-${color}-100 text-sm font-medium`}>{title}</div>
  </div>
));

// 메모이제이션된 계산
const useStats = (bookings: any[]) => {
  return useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const pending = bookings.filter(b => b.status === 'PENDING').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return { total, confirmed, pending, cancelled, totalRevenue };
  }, [bookings]);
};
```

### 3. 시스템 레벨 최적화

#### A. 로그 파일 관리
```bash
# logs/ 디렉토리 정리 스크립트
# cleanup-logs.bat
@echo off
echo Cleaning up old log files...
forfiles /p "logs" /s /m *.log /d -7 /c "cmd /c del @path" 2>nul
forfiles /p "logs" /s /m *.json /d -3 /c "cmd /c del @path" 2>nul
echo Log cleanup completed.
```

#### B. 메모리 모니터링 스크립트
```javascript
// scripts/memory-monitor.js
const { exec } = require('child_process');

function getMemoryUsage() {
  return new Promise((resolve) => {
    exec('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', (error, stdout) => {
      if (error) {
        console.error('Error getting memory usage:', error);
        resolve(null);
        return;
      }
      
      const lines = stdout.split('\n');
      if (lines.length > 1) {
        const parts = lines[1].split(',');
        const memoryStr = parts[4].replace(/"/g, '').replace(' K', '');
        const memoryMB = parseInt(memoryStr) / 1024;
        resolve(memoryMB);
      } else {
        resolve(null);
      }
    });
  });
}

async function monitorMemory() {
  const memory = await getMemoryUsage();
  if (memory) {
    console.log(`Memory usage: ${memory.toFixed(2)} MB`);
    if (memory > 100) {
      console.warn('⚠️  High memory usage detected!');
    }
  }
}

// 30초마다 메모리 사용량 체크
setInterval(monitorMemory, 30000);
monitorMemory();
```

### 4. 프로덕션 최적화

#### A. Docker 최적화
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3900

ENV PORT 3900
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### B. PM2 설정
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'rsvshop',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=512 --optimize-for-size',
    },
    max_memory_restart: '300M',
    node_args: '--max-old-space-size=512',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
  }],
};
```

## 모니터링 및 유지보수

### 1. 메모리 사용량 모니터링
```bash
# package.json에 추가
{
  "scripts": {
    "monitor": "node scripts/memory-monitor.js",
    "dev:monitor": "concurrently \"npm run dev\" \"npm run monitor\""
  }
}
```

### 2. 정기적인 최적화 작업
- **주간**: 로그 파일 정리
- **월간**: 번들 크기 분석
- **분기별**: 메모리 사용량 리뷰

### 3. 성능 지표
- **목표 메모리 사용량**: < 50MB (개발), < 100MB (프로덕션)
- **빌드 시간**: < 30초
- **첫 페이지 로드**: < 2초

## 결론

현재 프로젝트의 메모리 사용량은 Next.js 개발 환경에서 일반적인 수준이지만, 위의 최적화 전략을 적용하면 30-50% 정도 메모리 사용량을 줄일 수 있습니다. 특히 개발 환경에서의 성능 향상과 프로덕션 환경에서의 안정성을 크게 개선할 수 있습니다.

---

**참고 자료**
- [Node.js 메모리 최적화 가이드](https://medium.com/@mohantaankit2002/optimizing-memory-usage-in-node-js-applications-for-high-traffic-scenarios-1a6d4658aa9d)
- [opti-node 프로젝트](https://github.com/tcrowe/opti-node)
- [고트래픽 애플리케이션을 위한 메모리 관리](https://medium.com/@general_28805/optimizing-memory-management-in-node-js-for-high-traffic-applications-e4a3ed642166) 