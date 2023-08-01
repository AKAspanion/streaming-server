import { deleteMediaDB, pushMediaDB, pushVideoDB } from '@database/json';
import { getOneMediaData } from '@modules/media/mediaData';
import { getOneVideoData } from '@modules/video/videoData';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import fs from 'fs';

export const getVideoSubtitle: RequestHandler = async (req, res) => {
  const videoId = req.params.videoId || '';
  const { data } = await getOneVideoData(videoId);

  if (data?.sub) {
    const fileName = `/${data?.sub.id}.wtt`;

    res.download(data?.sub.path, fileName);
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Subtitle not found' });
  }
};

export const getMediaSubtitle: RequestHandler = async (req, res) => {
  const mediaId = req.params.mediaId || '';
  const { data } = await getOneMediaData(mediaId);

  if (data?.sub) {
    const fileName = `/${data?.sub.id}.wtt`;

    res.download(data?.sub.path, fileName);
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Subtitle not found' });
  }
};

export const addVideoSubtitle: RequestHandler = async (req, res) => {
  const videoId = req.params.videoId || '';
  await getOneVideoData(videoId);

  const id = randomUUID();

  const body = { ...req.file, id };
  const { error: pushError } = await pushVideoDB(`/${videoId}/sub`, body);

  if (pushError) {
    handleJSONDBDataError(pushError, videoId);
  }

  const data = { ...body };

  return res.status(HttpCode.OK).send({ data });
};

export const addMediaSubtitle: RequestHandler = async (req, res) => {
  const mediaId = req.params.mediaId || '';

  await getOneMediaData(mediaId);

  const id = randomUUID();

  const body = { ...req.file, name: req?.body?.name, id };
  const { error: pushError } = await pushMediaDB(`/${mediaId}/sub`, body);

  if (pushError) {
    handleJSONDBDataError(pushError, mediaId);
  }

  const data = { ...body };

  return res.status(HttpCode.OK).send({ data });
};

export const deleteMediaSubtitle: RequestHandler = async (req, res) => {
  const mediaId = req.params.mediaId || '';

  const { data } = await getOneMediaData(mediaId);

  const deletePaths = [data?.sub?.path].filter(Boolean);

  deletePaths.forEach((fullPath) => {
    if (fullPath) {
      fs.unlink(fullPath, async (err) => {
        if (err) throw err;
      });
    }
  });

  const { error: deleteError } = await deleteMediaDB(`/${mediaId}/sub`);

  if (deleteError) {
    handleJSONDBDataError(deleteError, mediaId);
  }

  return res.status(HttpCode.OK).send({ data: { messsage: 'Subtitle deleted successfully' } });
};
