import { AppError, HttpCode } from '@utils/exceptions';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import { addOneFolder, getAllFolderData, getOneFolderData } from './folderData';
import { getAllMediaData } from '@modules/media/mediaData';

export const addFolder: RequestHandler = async (req, res) => {
  if (!req?.body?.name) {
    throw new AppError({ description: 'Name is required', httpCode: HttpCode.BAD_REQUEST });
  }

  const id = randomUUID();

  const body = {
    id,
    name: req?.body?.name,
    category: req?.body?.category,
    description: req?.body?.description,
  };
  await addOneFolder(id, body);

  const data = { ...body };

  return res.status(HttpCode.OK).send({ data });
};

export const getFolder: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
  const { data } = await getOneFolderData(id);

  return res.status(HttpCode.OK).send({ data });
};

export const getAllFolder: RequestHandler = async (req, res) => {
  const { data } = await getAllFolderData();

  return res.status(HttpCode.OK).send({ data });
};

export const getMediaInFolder: RequestHandler = async (req, res) => {
  const id = req.params.id || '';

  await getOneFolderData(id);

  const { data } = await getAllMediaData();

  const result = data.filter((d) => d?.folderId === id);

  return res.status(HttpCode.OK).send({ data: result });
};
