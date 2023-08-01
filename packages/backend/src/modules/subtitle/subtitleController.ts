import { pushVideoDB } from '@database/json';
import { getOneVideoData } from '@modules/video/videoData';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';

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
  const videoId = req.params.videoId || '';
  const { data } = await getOneVideoData(videoId);

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
