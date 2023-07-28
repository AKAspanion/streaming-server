import { errorHandler } from '@utils/exceptions';
import { processLogger } from './logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
process.on('unhandledRejection', (reason: Error | any) => {
  processLogger.info(`Unhandled Rejection: ${reason?.message || reason}`, reason);

  throw new Error(reason?.message || reason);
});

process.on('uncaughtException', (error: Error) => {
  processLogger.info(`Uncaught Exception: ${error.message}`, error);

  errorHandler.handleError(error);
});
