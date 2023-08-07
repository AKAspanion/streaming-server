import { normalizeText } from '@common/utils/validate';
import { deleteMediaDB, geMediaDBIndex, pushMediaDB, pushVideoDB } from '@database/json';
import { getOneMediaData } from '@modules/media/mediaData';
import { getOneVideoData } from '@modules/video/videoData';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import fs from 'fs';

export const getVideoSubtitle: RequestHandler = async (req, res) => {
  const videoId = normalizeText(req.params.videoId);
  const { data } = await getOneVideoData(videoId);

  if (data?.sub) {
    const fileName = `/${data?.sub.id}.wtt`;

    res.download(data?.sub.path, fileName);
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Subtitle not found' });
  }
};

export const getMediaSubtitle: RequestHandler = async (req, res) => {
  const mediaId = normalizeText(req.params.mediaId);
  const { data } = await getOneMediaData(mediaId);

  const subtitleStream = data?.selectedSubtitle || 0;

  const foundSub = (data?.subs || [])[subtitleStream];

  if (foundSub) {
    const fileName = `/${foundSub.id}.srt`;

    res.download(foundSub.path, fileName);
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Subtitle not found' });
  }
};

export const addVideoSubtitle: RequestHandler = async (req, res) => {
  const videoId = normalizeText(req.params.videoId);
  await getOneVideoData(videoId);

  const id = randomUUID();

  const body = { ...req.file, id };
  const { error: pushError } = await pushVideoDB(`/${videoId}/subs[]`, body);

  if (pushError) {
    handleJSONDBDataError(pushError, videoId);
  }

  const data = { ...body };

  return res.status(HttpCode.OK).send({ data });
};

export const addMediaSubtitle: RequestHandler = async (req, res) => {
  const mediaId = normalizeText(req.params.mediaId);

  await getOneMediaData(mediaId);

  const id = randomUUID();

  const body = { ...req.file, name: req?.body?.name, id };
  const { error: pushError } = await pushMediaDB(`/${mediaId}/subs[]`, body);

  if (pushError) {
    handleJSONDBDataError(pushError, mediaId);
  }

  const data = { ...body };

  return res.status(HttpCode.OK).send({ data });
};

export const deleteMediaSubtitle: RequestHandler = async (req, res) => {
  const mediaId = normalizeText(req.params.mediaId);

  const { data } = await getOneMediaData(mediaId);

  const deletePaths = [data?.sub?.path].filter(Boolean);

  deletePaths.forEach((fullPath) => {
    if (fullPath) {
      fs.unlink(fullPath, async () => {
        // if (err) throw err;
      });
    }
  });

  if (data?.sub?.id) {
    const index = await geMediaDBIndex('/arraytest/myarray', data?.sub?.id);
    const { error: deleteError } = await deleteMediaDB(`/${mediaId}/subs[${index}]`);

    if (deleteError) {
      handleJSONDBDataError(deleteError, mediaId);
    }
  }

  return res.status(HttpCode.OK).send({ data: { messsage: 'Subtitle deleted successfully' } });
};
