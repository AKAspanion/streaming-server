/* eslint-disable @typescript-eslint/no-explicit-any */
import { SEGMENT_TEMP_FOLDER } from '@constants/hls';
import { deleteMediaDB, getMediaDataDB, pushMediaDB } from '@database/json';
import HLSManager from '@lib/hls-manager';
import { processHLSStream } from '@services/hls';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { createHLSStream, createVideoThumbnail, getVideoMetaData } from '@utils/ffmpeg';
import { getFileType } from '@utils/file';
import { deleteDirectory, getResourcePath, makeDirectory } from '@utils/helper';
import { extractHLSFileInfo, generateManifest } from '@utils/hls';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';

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

  const metadata: MediaTypeJSONDB = await getVideoMetaData(file.path);
  const thumbnail = await createVideoThumbnail(file.path, metadata.originalName);

  const id = randomUUID();

  const body = {
    ...metadata,
    thumbnail,
    path: file.path,
    addDate: new Date().getTime(),
  };

  const { error } = await pushMediaDB(`/${id}`, body);

  if (error) {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem adding Video',
    });
  }

  return res.status(HttpCode.OK).send({ data: { message: 'Video added successfully' } });
};

export const getAllMedia: AddMediaRequestHandler = async (req, res) => {
  HLSManager.stopGlobalTranscodings();
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

export const deleteMedia: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
  const { data, error } = await getMediaDataDB<MediaTypeJSONDB>(`/${id}`);

  if (error) {
    handleJSONDBDataError(error, id);
  }

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }

  const { error: deleteError } = await deleteMediaDB(`/${id}`);

  if (deleteError) {
    handleJSONDBDataError(deleteError, id);
  }

  return res.status(HttpCode.OK).send({ data: { message: 'Video deleted successfully' } });
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

  return res.status(HttpCode.OK).send({ data: { ...data, id } });
};

export const markFavourite: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
  const { data, error } = await getMediaDataDB<MediaTypeJSONDB>(`/${id}`);

  if (error) {
    handleJSONDBDataError(error, id);
  }

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }

  const body = { ...data, isFavourite: !data?.isFavourite };

  const { error: pushError } = await pushMediaDB(`/${id}`, body);

  if (pushError) {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem updating Video',
    });
  }

  return res.status(HttpCode.OK).send({ data: { message: 'Video marked as favourite' } });
};

export const markWatched: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
  const { data, error } = await getMediaDataDB<MediaTypeJSONDB>(`/${id}`);

  if (error) {
    handleJSONDBDataError(error, id);
  }

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }

  const body = { ...data, watched: !data?.watched };

  const { error: pushError } = await pushMediaDB(`/${id}`, body);

  if (pushError) {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem updating Video',
    });
  }

  return res.status(HttpCode.OK).send({ data: { message: 'Video marked as favourite' } });
};

export const playMedia: RequestHandler = async (req, res) => {
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

  const hlsPath = getResourcePath(SEGMENT_TEMP_FOLDER + id);

  deleteDirectory(hlsPath);
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

  const { ism3u8, mediaId, segment, isInvalid } = extractHLSFileInfo(file);

  if (isInvalid) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Not a HLS request' });
  }

  const hlsPath = getResourcePath(SEGMENT_TEMP_FOLDER + mediaId);
  const urlFilePath = `${hlsPath}/${file}`;

  if (ism3u8) {
    return res.download(urlFilePath);
  }

  const { data, error } = await getMediaDataDB<MediaTypeJSONDB>(`/${mediaId}`);
  const audioStream = 1;

  if (error) {
    handleJSONDBDataError(error, mediaId);
  }

  if (!data?.format?.filename) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }
  const duration = Number(data?.format?.duration);
  const hlsManager = new HLSManager();
  const group = mediaId;

  hlsManager.setLastRequestedTime(group);

  const videoPath = data?.format?.filename;

  // return new Promise<boolean>((resolve) => {
  const startSegment = Math.max(segment - 1, 0);

  // Should be lock per group somehow
  try {
    const filePath = await processHLSStream({
      audioStream,
      videoPath,
      hlsManager,
      group,
      startSegment,
      segment,
      file,
      duration,
    });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.status(HttpCode.OK).download(filePath);
  } catch (error) {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'File not found' });
  }
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

  return res.status(HttpCode.OK).send({ file });
};
