import { getTokenInRequest, verifySignedToken } from '@services/jwt';
import { AppError, HttpCode } from '@utils/exceptions';
import { RequestHandler } from 'express';

export const authenticate: RequestHandler = (req, res, next) => {
  const token = getTokenInRequest(req);

  if (!token) {
    throw new AppError({ httpCode: HttpCode.UNAUTHORIZED, description: 'Token not provided' });
  }

  try {
    const verified = verifySignedToken(token);
    if (verified) {
      next();
    } else {
      throw new AppError({ httpCode: HttpCode.UNAUTHORIZED, description: 'Token not valid' });
    }
  } catch (error) {
    throw new AppError({ httpCode: HttpCode.UNAUTHORIZED, description: 'Token not valid' });
  }
};
