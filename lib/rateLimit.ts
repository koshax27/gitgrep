type RateLimitStore = {
  [key: string]: {
    count: number;
    resetTime: number;
  };
};

const store: RateLimitStore = {};

export function rateLimit(identifier: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now();
  const record = store[identifier];

  if (!record || now > record.resetTime) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { success: true, limit, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0 };
  }

  record.count++;
  return { success: true, limit, remaining: limit - record.count };
}