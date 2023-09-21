import { MANIFEST_TEMP_FOLDER } from '@constants/hls';
import { pushMediaDB } from '@database/json';
import { processHLSStream } from '@services/hls';
import HLSManager from '@lib/hls-manager';
import { AppError, HttpCode } from '@utils/exceptions';
import {
  createHLSStream,
  createSeekThumbnail,
  createPoster,
  getVideoMetaData,
} from '@utils/ffmpeg';
import { getFileType } from '@utils/file';
import { getResourcePath, makeDirectory } from '@utils/helper';
import { extractHLSFileInfo, generateManifest } from '@utils/hls';
import { RequestHandler } from 'express';
import {
  addOneMedia,
  getAllMediaData,
  getOneMediaData,
  deleteMediaData,
  addMediaWithFolder,
  extractThumbnailForMedia,
  extractPosterForMedia,
} from './mediaData';
import { normalizeText } from '@common/utils/validate';
import logger from '@utils/logger';
import { getTokenInRequest } from '@services/jwt';

export const getMedia: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const { data } = await getOneMediaData(id);

  return res.status(HttpCode.OK).send({ data: { ...data, id } });
};

export const getAllMedia: RequestHandler = async (req, res) => {
  const { data } = await getAllMediaData();

  const mediaList = data.filter((m) => !m.folderId);

  return res.status(HttpCode.OK).send({ data: mediaList });
};

export const addMedia: RequestHandler = async (req, res) => {
  const { file, folderId } = req.body;

  if (!file?.path) {
    throw new AppError({ description: 'File path is required', httpCode: HttpCode.BAD_REQUEST });
  }

  const { type } = getFileType(file.path);

  if (type === 'directory') {
    await addMediaWithFolder(file?.path, file.name || file.path);
  } else {
    await addOneMedia(file?.path, folderId);
  }

  return res.status(HttpCode.OK_CREATED).send({ data: { message: 'Media added successfully' } });
};

export const deleteMedia: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);

  const { data } = await getOneMediaData(id);

  await deleteMediaData(data);

  return res.status(HttpCode.OK).send({ data: { message: 'Media deleted successfully' } });
};

export const updatePlayStatus: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const b = req.body;
  const { data } = await getOneMediaData(id);

  const body = { ...data, ...b, lastPlayedDate: new Date().getTime() };

  const { error: pushError } = await pushMediaDB(`/${id}`, body);

  if (pushError) {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem updating play status',
    });
  }

  return res.status(HttpCode.OK).send({ data: { message: 'Play status updated successfully' } });
};

export const markFavorite: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const { data } = await getOneMediaData(id);

  const body = { ...data, isFavorite: !data?.isFavorite };

  const { error: pushError } = await pushMediaDB(`/${id}`, body);

  if (pushError) {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem updating Media',
    });
  }

  return res.status(HttpCode.OK).send({ data: { message: 'Media marked as favorite' } });
};

export const markWatched: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const { data } = await getOneMediaData(id);

  const body = { ...data, watched: !data?.watched };

  const { error: pushError } = await pushMediaDB(`/${id}`, body);

  if (pushError) {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem updating Media',
    });
  }

  return res.status(HttpCode.OK).send({ data: { message: 'Media marked as favorite' } });
};

export const setAudioStream: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  HLSManager.stopVideoTranscoder(id);

  const { data } = await getOneMediaData(id);

  if (req?.body?.index === undefined) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Audio index is required' });
  }

  if (req?.body?.index === data?.selectedAudio) {
    res.status(HttpCode.OK).send({ data: { message: 'Audio index is already set' } });
  }

  const body: MediaTypeJsonDB = { ...data, selectedAudio: req?.body?.index };

  const { error: pushError } = await pushMediaDB(`/${id}`, body);

  if (pushError) {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem updating Media',
    });
  }

  return res.status(HttpCode.OK).send({ data: { message: 'Media audio index updated' } });
};

export const setSubtitleStream: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  HLSManager.stopVideoTranscoder(id);

  const { data } = await getOneMediaData(id);

  if (req?.body?.index === undefined) {
    throw new AppError({
      httpCode: HttpCode.BAD_REQUEST,
      description: 'Subtitle index is required',
    });
  }

  if (req?.body?.index === data?.selectedSubtitle) {
    res.status(HttpCode.OK).send({ data: { message: 'Subtitle index is already set' } });
  }

  const body: MediaTypeJsonDB = { ...data, selectedSubtitle: req?.body?.index };

  const { error: pushError } = await pushMediaDB(`/${id}`, body);

  if (pushError) {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem updating Media',
    });
  }

  return res.status(HttpCode.OK).send({ data: { message: 'Media subtitle index updated' } });
};

export const playMedia: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const { data } = await getOneMediaData(id);

  const manifestFile = `${id}.m3u8`;

  const hlsPath = getResourcePath(MANIFEST_TEMP_FOLDER + id);

  makeDirectory(hlsPath);

  const token = getTokenInRequest(req);

  generateManifest(id, Number(data?.format?.duration), token);

  return res
    .status(HttpCode.OK)
    .send({ data: { ...data, id, src: `/media/stream/hls/${manifestFile}` } });
};

export const stopMedia: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  await getOneMediaData(id);

  const hlsManager = new HLSManager();

  if (hlsManager.isAnyVideoTranscoderActive(id)) {
    HLSManager.stopVideoTranscoder(id);
  }

  return res.status(HttpCode.OK).send({ data: { message: 'Media stopped successfully' } });
};

export const streamMedia: RequestHandler = async (req, res) => {
  const reqUrl = req.url.split('?').shift() || '';
  const file = reqUrl.split('/stream/hls/').pop();

  if (!file) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Not a HLS request' });
  }

  const { ism3u8, mediaId, segment, isInvalid } = extractHLSFileInfo(file);

  if (isInvalid) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Not a HLS request' });
  }

  const manifestPath = getResourcePath(MANIFEST_TEMP_FOLDER + mediaId);
  const manifestFilePath = `${manifestPath}/${file}`;

  if (ism3u8) {
    return res.download(manifestFilePath);
  }

  const { data } = await getOneMediaData(mediaId);
  const audioStream = Number(data?.selectedAudio || '1');

  if (!data?.format?.filename) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }
  const hlsManager = new HLSManager();
  const group = mediaId;

  hlsManager.setLastRequestedTime(group);

  const videoPath = data?.format?.filename;
  const duration = Number(data?.format?.duration);

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
    logger.error(error);
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'File not found' });
  }
};

export const getThumbnail: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const { data } = await getOneMediaData(id);

  const thumbnail = await extractThumbnailForMedia(data?.id, data);

  if (thumbnail?.path) {
    res.download(thumbnail?.path, thumbnail.name || 'thumbnail.png');
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Thumbnail not found' });
  }
};

export const getPoster: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const { data } = await getOneMediaData(id);

  const poster = await extractPosterForMedia(data?.id, data);
  const thumbnail = await extractThumbnailForMedia(data?.id, data);

  const posterPath = poster?.path || thumbnail?.path;

  if (posterPath) {
    res.download(posterPath, 'poster.jpg');
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Poster not found' });
  }
};

export const getSeekThumbnail: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const time = parseInt(normalizeText(req.query.time));

  const { data } = await getOneMediaData(id);

  if (data?.path) {
    const thumbnail = await createSeekThumbnail(id, data?.path, time);
    res.download(thumbnail?.path, thumbnail.name || 'thumb_seek.png');
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Thumbnail not found' });
  }
};

export const generateStream: RequestHandler = async (req, res) => {
  const id = normalizeText(req.params.id);
  const { data } = await getOneMediaData(id);

  const path = await createHLSStream(data?.format?.filename, id);

  return res.status(HttpCode.OK).send({ data: { path } });
};

export const probeFile: RequestHandler = async (req, res) => {
  const { file } = req.body;

  const data = await getVideoMetaData(file);

  return res.status(HttpCode.OK).send({ data });
};

export const testStuff: RequestHandler = async (req, res) => {
  const { file } = req.body;

  const { posterPath } = await createPoster('lol', file);

  return res.status(HttpCode.OK).send({ posterPath, file });
};
