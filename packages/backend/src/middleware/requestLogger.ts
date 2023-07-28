import { RequestHandler } from 'express';
import { accessLoggger } from '@utils/logger';

export const requestLogger: RequestHandler = (req, res, next) => {
  accessLoggger.info(
    `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`,
  );

  res.on('finish', () => {
    accessLoggger.info(
      `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`,
    );
  });

  next();
};
