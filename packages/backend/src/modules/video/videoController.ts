import { deleteVideoDB, pushVideoDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import fs from 'fs';
import { getAllVideoData, getOneVideoData } from './videoData';
import { deleteFilesSilently } from '@utils/helper';
import { normalizeText } from '@common/utils/validate';

export const addVideo: RequestHandler = async (req, res) => {
  const id = randomUUID();

  const body = { ...req.file };
  const { error } = await pushVideoDB(`/${id}`, body);

  if (error) {
    handleJSONDBDataError(error, id);
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
    handleJSONDBDataError(deleteError, id);
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

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(result.path, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
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
