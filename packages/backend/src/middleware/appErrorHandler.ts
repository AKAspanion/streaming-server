import { errorHandler } from "@utils/exceptions";
import { ErrorRequestHandler } from "express";

export const appErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  return errorHandler.handleError(err, res);
};
