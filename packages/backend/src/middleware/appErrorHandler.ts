import { errorHandler } from '@utils/exceptions';
import { ErrorRequestHandler } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const appErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  return errorHandler.handleError(err, res);
};
