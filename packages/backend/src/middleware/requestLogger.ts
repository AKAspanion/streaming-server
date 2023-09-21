import { RequestHandler } from 'express';
import { accessLogger } from '@utils/logger';

export const requestLogger: RequestHandler = (req, res, next) => {
  accessLogger.info(
    `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`,
  );

  res.on('finish', () => {
    accessLogger.info(
      `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`,
    );
  });

  next();
};
