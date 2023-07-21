import { deleteVideoDB, getVideoDataDB, pushVideoDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import fs from 'fs';

export const getSubtitle: RequestHandler = async (req, res) => {
  const videoId = req.params.videoId || '';
  const { data, error } = await getVideoDataDB<VideoTypeJSONDB>(`/${videoId}`);

  if (error) {
    handleJSONDBDataError(error, videoId);
  }

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Video not found' });
  }

  if (data?.sub) {
    const fileName = `/${data?.sub.id}.wtt`;

    res.download(data?.sub.path, fileName);
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Subtitle not found' });
  }
};

export const addSubtitle: RequestHandler = async (req, res) => {
  const videoId = req.params.videoId || '';
  const { error, data: result } = await getVideoDataDB<VideoTypeJSONDB>(`/${videoId}`);

  if (error) {
    handleJSONDBDataError(error, videoId);
  }
  if (!result) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Video not found' });
  }

  const id = randomUUID();

  const body = { ...req.file, id };
  const { error: pushError } = await pushVideoDB(`/${videoId}/sub`, body);

  if (pushError) {
    handleJSONDBDataError(pushError, videoId);
  }

  const data = { ...body };

  return res.status(HttpCode.OK).send({ data });
};

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
  const id = req.params.id || '';
  const { data, error } = await getVideoDataDB<VideoTypeJSONDB>(`/${id}`);

  if (error) {
    handleJSONDBDataError(error, id);
  }

  const deletePaths = [data?.path, data?.sub?.path];

  deletePaths.forEach((fullPath) => {
    if (fullPath) {
      fs.unlink(fullPath, async (err) => {
        if (err) throw err;
      });
    }
  });

  const { error: deleteError } = await deleteVideoDB(`/${id}`);

  if (deleteError) {
    handleJSONDBDataError(deleteError, id);
  }

  return res.status(HttpCode.OK).send({ message: 'Video deleted successfully' });
};

export const streamVideo: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
  const range = req.headers.range;
  const { data: result, error } = await getVideoDataDB<VideoTypeJSONDB>(`/${id}`);

  if (error) {
    handleJSONDBDataError(error, id);
  }
  if (!result) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Video not found' });
  }

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
  const { data: result, error } = await getVideoDataDB<Record<string, VideoTypeJSONDB>>(`/`);
  if (error) {
    handleJSONDBDataError(error);
  }

  if (!result) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Video not found' });
  }

  const data: VideoTypeJSONDB[] = result
    ? Object.keys(result || {}).map((id) => ({
        ...(result[id] || {}),
        id,
      }))
    : [];

  return res.status(HttpCode.OK).send({ data });
};

export const getVideo: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
  const { data, error } = await getVideoDataDB<VideoTypeJSONDB>(`/${id}`);

  if (error) {
    handleJSONDBDataError(error, id);
  }

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Video not found' });
  }

  return res.status(HttpCode.OK).send({ data });
};
