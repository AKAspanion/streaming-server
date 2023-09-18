import { getSignedToken, getTokenInRequest, verifySignedToken } from '@services/jwt';
import { AppError, HttpCode } from '@utils/exceptions';
import { RequestHandler } from 'express';

export const generateToken: RequestHandler = async (req, res) => {
  const data = { time: Date() };

  const token = getSignedToken(data);

  return res.status(HttpCode.OK).send({ data: { token } });
};

export const verifyToken: RequestHandler = async (req, res) => {
  try {
    const token = getTokenInRequest(req);

    const verified = verifySignedToken(token);
    if (verified) {
      return res.status(HttpCode.OK).send({ data: { message: 'Successfully Verified' } });
    } else {
      throw new AppError({ httpCode: HttpCode.UNAUTHORIZED, description: 'Token not valid' });
    }
  } catch (error) {
    throw new AppError({ httpCode: HttpCode.UNAUTHORIZED, description: 'Token not valid' });
  }
};
