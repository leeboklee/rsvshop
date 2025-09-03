import { PrismaClient } from '@prisma/client';

// Windows/WSL 호환성을 위한 간단한 Prisma 클라이언트 설정
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // 개발 환경에서 hot-reload 시 싱글톤 유지
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = (global as any).prisma;
}

export default prisma;
export { prisma };
