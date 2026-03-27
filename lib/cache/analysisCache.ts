// lib/cache/analysisCache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function getCachedAnalysis(repoFullName: string): Promise<any | null> {
  const cached = await redis.get(`analysis:${repoFullName}`);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedAnalysis(repoFullName: string, analysis: any, ttl = 86400) {
  await redis.set(`analysis:${repoFullName}`, JSON.stringify(analysis), 'EX', ttl);
}