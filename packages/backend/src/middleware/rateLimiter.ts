import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min in milliseconds
  limit: 1000,
  message: 'You have exceeded the request limit!',
  standardHeaders: true,
  legacyHeaders: false,
});
