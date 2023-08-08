import { HttpCode } from '@utils/exceptions';
import logger from '@utils/logger';
import { RequestHandler } from 'express';

export const quitServer: RequestHandler = async (_, res) => {
  logger.info('Received kill signal, shutting down gracefully');

  setTimeout(() => {
    logger.info('Closing');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Could not close in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  return res.status(HttpCode.OK).send({ message: 'Server exit started' });
};
