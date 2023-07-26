/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMediaDataDB, pushMediaDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { createHLS, createVideoThumbnail, getffmpeg, readVideoMetaData } from '@utils/ffmpeg';
import { getFileType } from '@utils/file';
import logger from '@utils/logger';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import fs from 'fs';

type AddMediaRequestHandler = RequestHandler<{ body: { file: FileLocationType } }>;

export const addMedia: AddMediaRequestHandler = async (req, res) => {
  const { file } = req.body;

  if (!file?.path) {
    throw new AppError({
      description: 'File path is required',
      httpCode: HttpCode.BAD_REQUEST,
    });
  }

  const { type } = getFileType(file.path);

  if (type === 'directory') {
    throw new AppError({
      description: 'File path points to a directory',
      httpCode: HttpCode.BAD_REQUEST,
    });
  }

  const metadata: MediaTypeJSONDB = await readVideoMetaData(file.path);
  const thumbnail = await createVideoThumbnail(file.path, metadata.originalName);
  await createHLS(file.path, metadata.originalName);

  const id = randomUUID();

  const body = { ...metadata, thumbnail, path: file.path };
  const { error } = await pushMediaDB(`/${id}`, body);

  if (error) {
    handleJSONDBDataError(error, id);
  }

  return res.status(HttpCode.OK).send({ data: 'Video added successfully' });
};

export const getAllMedia: AddMediaRequestHandler = async (req, res) => {
  const { data: result, error } = await getMediaDataDB<Record<string, MediaTypeJSONDB>>(`/`);
  if (error) {
    handleJSONDBDataError(error);
  }

  if (!result) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Video not found' });
  }

  const data: MediaType[] = (
    result
      ? Object.keys(result || {}).map((id) => ({
          ...(result[id] || {}),
          id,
        }))
      : []
  ).map((d) => {
    return {
      id: d.id,
      path: d.path,
      format: d.format,
      originalName: d.originalName,
      mimeType: d.mimeType,
    };
  });

  return res.status(HttpCode.OK).send({ data });
};

export const getMedia: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
  const { data, error } = await getMediaDataDB<MediaTypeJSONDB>(`/${id}`);

  if (error) {
    handleJSONDBDataError(error, id);
  }

  console.log(data);

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }

  return res.status(HttpCode.OK).send({ data: { ...data, id } });
};

export const getThumbnail: RequestHandler = async (req, res) => {
  const mediaId = req.params.mediaId || '';
  const { data, error } = await getMediaDataDB<MediaTypeJSONDB>(`/${mediaId}`);

  if (error) {
    handleJSONDBDataError(error, mediaId);
  }

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }

  if (data?.thumbnail && data?.thumbnail?.path) {
    res.download(data?.thumbnail?.path, data?.thumbnail.name || 'thumbnail.png');
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Thumbnail not found' });
  }
};

export const streamMedia: RequestHandler = async (req, res) => {
  const id = req.params.mediaId || '';
  const range = req.headers.range;
  const { data: result, error } = await getMediaDataDB<MediaTypeJSONDB>(`/${id}`);

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
  // const videoStream = fs.createReadStream(result.path, { start, end });

  // Stream the video chunk to the client
  // videoStream.pipe(res);

  // convert and stream video chunk to client
  const ffmpeg = getffmpeg();
  logger.info('Streaming', result.path);
  ffmpeg(result.path, { timeout: 432000 })
    .addOptions([
      '-profile:v baseline',
      '-level 3.0',
      '-start_number 0',
      '-hls_time 10',
      '-hls_list_size 0',
      '-f hls',
    ])
    .on('error', function (err, stdout, stderr) {
      console.log(err.message); //this will likely return "code=1" not really useful
      console.log('stdout:\n' + stdout);
      console.log('stderr:\n' + stderr); //this will contain more detailed debugging info
    })
    .pipe(res);
};
