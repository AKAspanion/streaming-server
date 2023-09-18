/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import * as core from 'express-serve-static-core';
import type { Request } from 'express';
import { TOKEN_HEADER_KEY } from '@common/constants/app';
import { normalizeText } from '@common/utils/validate';

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'super_amazing_secret';
export const getSignedToken = (data: object) => {
  const token = jwt.sign(data, JWT_SECRET_KEY, { algorithm: 'HS512', expiresIn: '2h' });

  return token;
};

export const verifySignedToken = (token: string) => {
  const verified = jwt.verify(token, JWT_SECRET_KEY);

  return verified;
};

export const getTokenInRequest = (req: Request<core.ParamsDictionary, any, any>) => {
  return req.header(TOKEN_HEADER_KEY) || normalizeText(req.query.token, '');
};
