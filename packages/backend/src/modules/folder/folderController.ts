import { AppError, HttpCode } from '@utils/exceptions';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import { addOneFolder, getAllFolderData } from './folderData';

export const addFolder: RequestHandler = async (req, res) => {
  if (!req?.body?.name) {
    throw new AppError({ description: 'Name is required', httpCode: HttpCode.BAD_REQUEST });
  }

  const id = randomUUID();

  const body = { id, name: req?.body?.name, category: req?.body?.category };
  await addOneFolder(id, body);

  const data = { ...body };

  return res.status(HttpCode.OK).send({ data });
};

export const getAllFolder: RequestHandler = async (req, res) => {
  const { data } = await getAllFolderData();

  return res.status(HttpCode.OK).send({ data });
};
