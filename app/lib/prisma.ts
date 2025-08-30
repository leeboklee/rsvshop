import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

// 환경 변수 로딩 확인
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL 환경 변수가 설정되지 않았습니다.');
  console.error('현재 환경 변수:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    PWD: process.env.PWD
  });
  throw new Error('DATABASE_URL 환경 변수가 필요합니다.');
}

console.log('✅ DATABASE_URL 로드됨:', databaseUrl.replace(/\/\/.*@/, '//***:***@'));

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// WSL 환경 최적화: 연결 재시도 로직
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    // WSL 환경 최적화: 연결 풀 설정
    __internal: {
      engine: {
        connectionLimit: 3, // WSL에서는 적은 연결 수가 안정적
        pool: {
          min: 0,
          max: 5, // 최대 연결 수 제한
          idleTimeoutMillis: 60000, // 1분으로 증가
          acquireTimeoutMillis: 60000, // 1분으로 증가
        },
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// WSL 환경 최적화: 연결 재시도 로직
const connectWithRetry = async (maxRetries = 3, delay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Prisma 클라이언트 연결 성공');
      return;
    } catch (error) {
      console.error(`❌ Prisma 연결 시도 ${i + 1}/${maxRetries} 실패:`, error);
      if (i < maxRetries - 1) {
        console.log(`${delay}ms 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // 지수 백오프
      } else {
        console.error('최대 재시도 횟수 초과');
        throw error;
      }
    }
  }
};

// 초기 연결 시도
connectWithRetry().catch(console.error);

// WSL 환경 최적화: 정기적인 연결 상태 확인 및 재연결
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error('Prisma 연결 상태 확인 실패, 재연결 시도:', error);
    try {
      await prisma.$disconnect();
      await connectWithRetry(2, 1000);
    } catch (reconnectError) {
      console.error('Prisma 재연결 실패:', reconnectError);
    }
  }
}, 30000); // 30초마다 확인 (WSL에서는 더 자주) 