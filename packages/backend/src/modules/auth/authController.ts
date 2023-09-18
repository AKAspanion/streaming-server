import { normalizeText } from '@common/utils/validate';
import { AppError, HttpCode } from '@utils/exceptions';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const jwtSecretKey = process.env.JWT_SECRET_KEY || 'super_amazing_secret';

export const generateToken: RequestHandler = async (req, res) => {
  const data = { time: Date() };

  const token = jwt.sign(data, jwtSecretKey);

  return res.status(HttpCode.OK).send({ data: { token } });
};

export const verifyToken: RequestHandler = async (req, res) => {
  try {
    const token = normalizeText(req.query.token);

    const verified = jwt.verify(token, jwtSecretKey);
    if (verified) {
      return res.status(HttpCode.OK).send({ data: { message: 'Successfully Verified' } });
    } else {
      throw new AppError({ httpCode: HttpCode.UNAUTHORIZED, description: 'Token not valid' });
    }
  } catch (error) {
    throw new AppError({ httpCode: HttpCode.UNAUTHORIZED, description: 'Token not valid' });
  }
};
