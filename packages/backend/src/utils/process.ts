import { errorHandler } from '@utils/exceptions';
import { logger } from './logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
process.on('unhandledRejection', (reason: Error | any) => {
  logger.info(`Unhandled Rejection: ${reason?.message || reason}`);

  throw new Error(reason?.message || reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.info(`Uncaught Exception: ${error.message}`, error);

  errorHandler.handleError(error);
});
