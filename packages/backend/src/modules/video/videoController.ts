import { deleteVideoDB, pushVideoDB } from '@database/json';
import { handleJsonDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import fs from 'fs';
import { extractThumbnailForVideo, getAllVideoData, getOneVideoData } from './videoData';
import { deleteFilesSilently, fileExists } from '@utils/helper';
import { normalizeText } from '@common/utils/validate';
import { createSeekThumbnail } from '@utils/ffmpeg';

export const addVideo: RequestHandler = async (req, res) => {
  const id = randomUUID();

  const body = { ...req.file };
  const { error } = await pushVideoDB(`/${id}`, body);

  if (error) {
    handleJsonDBDataError(error, id);
  }

  const data = { id, ...body };

  return res.status(HttpCode.OK).send({ data });
};

export const deleteVideo: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const { data } = await getOneVideoData(id);

  deleteFilesSilently([data?.path, data?.sub?.path, data?.thumbnail?.path]);

  const { error: deleteError } = await deleteVideoDB(`/${id}`);

  if (deleteError) {
    handleJsonDBDataError(deleteError, id);
  }

  return res.status(HttpCode.OK).send({ message: 'Video deleted successfully' });
};

export const streamVideo: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const range = req.headers.range;
  const { data: result } = await getOneVideoData(id);

  if (!range) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Requires Range header' });
  }

  const videoSize = fs.statSync(result?.path).size;

  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const contentLength = end - start + 1;
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  };

  res.writeHead(HttpCode.PARTIAL_CONTENT, headers);

  const videoStream = fs.createReadStream(result.path, { start, end });

  videoStream.pipe(res);
};

export const getThumbnail: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);

  const { data } = await getOneVideoData(id);

  const thumbnail = await extractThumbnailForVideo(data?.id, data);

  if (thumbnail?.path) {
    res.download(thumbnail?.path, thumbnail.name || 'thumbnail.png');
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Thumbnail not found' });
  }
};

export const getSeekThumbnail: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const time = parseInt(normalizeText(req.query.time));

  const { data } = await getOneVideoData(id);

  if (fileExists(data?.path)) {
    const thumbnail = await createSeekThumbnail(id, data?.path, time);
    res.download(thumbnail?.path, thumbnail.name || 'thumbnail.png');
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Thumbnail not found' });
  }
};

export const getAllVideo: RequestHandler = async (_, res) => {
  const { data } = await getAllVideoData();

  return res.status(HttpCode.OK).send({ data });
};

export const getVideo: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const { data } = await getOneVideoData(id);

  return res.status(HttpCode.OK).send({ data });
};
