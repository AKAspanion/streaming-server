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

  const body = { ...req.file, id, copied: true };
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

  const body = { ...req.file, name: req?.body?.name, id, copied: true };
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

  const subtitleId = req?.body?.subtitleId;

  if (subtitleId === undefined) {
    throw new AppError({
      httpCode: HttpCode.BAD_REQUEST,
      description: 'Subtitle id is required',
    });
  }

  const { index, error } = await geMediaDBIndex(`/${mediaId}/subs`, subtitleId);
  if (error) {
    handleJSONDBDataError(error, subtitleId);
  }

  const { error: deleteError } = await deleteMediaDB(`/${mediaId}/subs[${index}]`);

  if (deleteError) {
    handleJSONDBDataError(deleteError, mediaId);
  }

  const deletePaths = [data?.sub?.path];

  if (index !== undefined && data?.subs && data?.subs?.length && data?.subs[index]?.copied) {
    deletePaths.push(data?.subs[index].path);
  }

  deletePaths.filter(Boolean).forEach((fullPath) => {
    if (fullPath) {
      fs.unlink(fullPath, async () => {
        // if (err) throw err;
      });
    }
  });

  return res.status(HttpCode.OK).send({ data: { messsage: 'Subtitle deleted successfully' } });
};
