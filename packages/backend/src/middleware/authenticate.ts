import { TOKEN_HEADER_KEY } from '@common/constants/app';
import { normalizeText } from '@common/utils/validate';
import { verifySignedToken } from '@services/jwt';
import { AppError, HttpCode } from '@utils/exceptions';
import { RequestHandler } from 'express';

export const authenticate: RequestHandler = (req, res, next) => {
  const token = req.header(TOKEN_HEADER_KEY) || normalizeText(req.query.token, '');

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
