import jwt from 'jsonwebtoken';

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'super_amazing_secret';
export const getSignedToken = (data: object) => {
  const token = jwt.sign(data, JWT_SECRET_KEY, { algorithm: 'HS512', expiresIn: '2h' });

  return token;
};

export const verifySignedToken = (token: string) => {
  const verified = jwt.verify(token, JWT_SECRET_KEY);

  return verified;
};
