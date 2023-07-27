/* eslint-disable @typescript-eslint/no-explicit-any */
import { MPEGTS_FILE_NO_SEPERATOR } from '@constants/app';
import { getMediaDataDB, pushMediaDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import {
  createHLSSegment,
  createHLSStream,
  createVideoThumbnail,
  getVideoMetaData,
} from '@utils/ffmpeg';
import { getFileType } from '@utils/file';
import { getResourcePath, makeDirectory } from '@utils/helper';
import { generateManifest } from '@utils/hls';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';

type AddMediaRequestHandler = RequestHandler<{ body: { file: FileLocationType } }>;

// let ffmpegProcess: FfmpegCommand;

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

  const metadata: MediaTypeJSONDB = await getVideoMetaData(file.path);
  const thumbnail = await createVideoThumbnail(file.path, metadata.originalName);
  // await createHLS(file.path, metadata.originalName);

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

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }

  if (!data?.format?.filename) {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'VIdeo path not found' });
  }

  const manifestFile = `${id}.m3u8`;

  const hlsPath = getResourcePath('_hls/' + id);

  makeDirectory(hlsPath);

  generateManifest(id, Number(data?.format?.duration));

  return res
    .status(HttpCode.OK)
    .send({ data: { ...data, id, src: `/media/stream/hls/${manifestFile}` } });
};

export const streamMedia: RequestHandler = async (req, res) => {
  const file = req.url.split('/stream/hls/').pop();

  if (!file) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Not a HLS request' });
  }

  const ext = file.split('.').pop();
  const fileId = file.split('.')[0];

  if (ext !== 'm3u8' && ext !== 'ts') {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Not a HLS request' });
  }

  const hlsPath = getResourcePath('_hls/' + fileId);
  const urlFilePath = `${hlsPath}/${file}`;

  if (ext === 'm3u8') {
    return res.download(urlFilePath);
  }

  const mediaId = fileId.split(MPEGTS_FILE_NO_SEPERATOR)[0];
  const { data, error } = await getMediaDataDB<MediaTypeJSONDB>(`/${mediaId}`);

  if (error) {
    handleJSONDBDataError(error, mediaId);
  }

  if (!data?.format?.filename) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }

  const segmentNo = Number(fileId.split(MPEGTS_FILE_NO_SEPERATOR).pop());
  const videoPath = data?.format?.filename;
  const duration = Number(data?.format?.duration);

  const path = await createHLSSegment(videoPath, {
    mediaId,
    segmentNo,
    duration,
  });
  return res.download(path);
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

export const generateStream: RequestHandler = async (req, res) => {
  const mediaId = req.params.mediaId || '';
  const { data, error } = await getMediaDataDB<MediaTypeJSONDB>(`/${mediaId}`);

  if (error) {
    handleJSONDBDataError(error, mediaId);
  }

  if (!data?.format?.filename) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }

  const path = await createHLSStream(data?.format?.filename, mediaId);

  return res.status(HttpCode.OK).send({ data: { path } });
};

export const probeFile: RequestHandler = async (req, res) => {
  const { file } = req.body;

  const data = await getVideoMetaData(file);

  return res.status(HttpCode.OK).send({ data });
};

export const testStuff: RequestHandler = async (req, res) => {
  const { file } = req.body;

  // const data = await createHLSSegment(file, { mediaId: string; segmentNo: number; duration: number });

  return res.status(HttpCode.OK).send({ file });
};
