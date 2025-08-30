import { prisma } from '@/app/lib/prisma';

export type GuardOptions = {
  retries?: number;
  delayMs?: number;
  label?: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function withPrismaGuard<T>(
  fn: () => Promise<T>,
  options: GuardOptions = {}
): Promise<T> {
  const max = options.retries ?? 2;
  let delay = options.delayMs ?? 300;
  const label = options.label ?? 'prisma-op';
  let lastError: unknown;

  for (let attempt = 1; attempt <= max + 1; attempt++) {
    const start = Date.now();
    try {
      const result = await fn();
      const elapsed = Date.now() - start;
      if (elapsed > 500) {
        console.warn(`[${label}] slow query: ${elapsed}ms`);
      }
      return result;
    } catch (error) {
      lastError = error;
      console.error(`[${label}] attempt ${attempt} failed:`, error);
      if (attempt <= max) {
        await sleep(delay);
        delay *= 1.5;
        continue;
      }
      throw error;
    }
  }
  throw lastError as any;
}

export { prisma };

