import { RequestHandler } from 'express';

export const authHandler: RequestHandler = (req, res, next) => {
  // TODO setup authentication
  next();
};
