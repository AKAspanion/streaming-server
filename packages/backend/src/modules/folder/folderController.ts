import { AppError, HttpCode } from '@utils/exceptions';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import { addOneFolder, getAllFolderData, getOneFolderData } from './folderData';
import { deleteMediaData, getAllMediaData } from '@modules/media/mediaData';
import { deleteFolderDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';
import { normalizeText } from '@common/utils/validate';

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

export const updateFolder: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const { data } = await getOneFolderData(id);

  const body = {
    id,
    name: req?.body?.name || data?.name,
    category: req?.body?.category || data?.category,
    description: req?.body?.description || data?.description,
  };

  await addOneFolder(id, body);

  return res.status(HttpCode.OK).send({ data: body });
};

export const deleteFolder: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const { data } = await getOneFolderData(id);

  const { data: mediaList } = await getAllMediaData();

  try {
    await Promise.all(
      mediaList.filter((m) => m.folderId === data.id).map((media) => deleteMediaData(media)),
    );
  } catch (error) {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Not able to delete folder ',
    });
  }

  const { error: deleteError } = await deleteFolderDB(`/${id}`);

  if (deleteError) {
    handleJSONDBDataError(deleteError, id);
  }

  return res.status(HttpCode.OK).send({ data });
};

export const getFolder: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const { data } = await getOneFolderData(id);

  return res.status(HttpCode.OK).send({ data });
};

export const getAllFolder: RequestHandler = async (req, res) => {
  const { data } = await getAllFolderData();

  const { data: mediaData } = await getAllMediaData();

  const result = data.map((f) => ({
    ...f,
    totalFiles: mediaData.filter((m) => m.folderId === f.id).length,
  }));

  return res.status(HttpCode.OK).send({ data: result });
};

export const getMediaInFolder: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);

  await getOneFolderData(id);

  const { data } = await getAllMediaData();

  const result = data.filter((d) => d?.folderId === id);

  return res.status(HttpCode.OK).send({ data: result });
};
