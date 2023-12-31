import { AppError, HttpCode } from './exceptions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleJsonDBDataError = (error: any, id?: string, db = 'Data') => {
  if (error.name === 'DataError') {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: `Can't find ${db}` });
  } else {
    throw new AppError({ httpCode: HttpCode.INTERNAL_SERVER_ERROR, description: error.message });
  }
};
