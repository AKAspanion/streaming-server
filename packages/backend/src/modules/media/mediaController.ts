import { SEGMENT_TEMP_FOLDER } from '@constants/hls';
import { deleteMediaDB, pushMediaDB } from '@database/json';
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
import { getAllMediaData, getOneMediaData } from './mediaData';

export const getMedia: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
  const { data } = await getOneMediaData(id);

  return res.status(HttpCode.OK).send({ data: { ...data, id } });
};

export const getAllMedia: RequestHandler = async (req, res) => {
  const { data } = await getAllMediaData();

  return res.status(HttpCode.OK).send({ data });
};

export const addMedia: RequestHandler = async (req, res) => {
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

  const audioStreams: MediaStreamType[] = [];
  (metadata?.streams || []).forEach((stream: MediaStreamType) => {
    if (stream?.codec_type === 'audio') {
      audioStreams.push(stream);
    }
  });

  const selectedAudio = String(audioStreams[0]?.index || '1');

  const id = randomUUID();

  const body: MediaTypeJSONDB = {
    ...metadata,
    audioStreams,
    thumbnail,
    selectedAudio,
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

export const deleteMedia: RequestHandler = async (req, res) => {
  const id = req.params.id || '';

  await getOneMediaData(id);

  const { error: deleteError } = await deleteMediaDB(`/${id}`);

  if (deleteError) {
    handleJSONDBDataError(deleteError, id);
  }

  return res.status(HttpCode.OK).send({ data: { message: 'Video deleted successfully' } });
};

export const updatePlayStatus: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
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

export const markFavourite: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
  const { data } = await getOneMediaData(id);

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
  const { data } = await getOneMediaData(id);

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

export const setAudioStream: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
  const { data } = await getOneMediaData(id);

  if (!req?.body?.index) {
    throw new AppError({
      httpCode: HttpCode.BAD_REQUEST,
      description: 'Audio index is required',
    });
  }

  const body: MediaTypeJSONDB = { ...data, selectedAudio: req?.body?.index };

  const { error: pushError } = await pushMediaDB(`/${id}`, body);

  if (pushError) {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem updating Video',
    });
  }

  HLSManager.stopVideotranscoders(id);

  return res.status(HttpCode.OK).send({ data: { message: 'Video audio index updated' } });
};

export const playMedia: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
  const { data } = await getOneMediaData(id);

  if (!data?.format?.filename) {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Video path not found' });
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

  const { data } = await getOneMediaData(mediaId);
  const audioStream = Number(data?.selectedAudio || '1');

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
  const id = req.params.id || '';
  const { data } = await getOneMediaData(id);

  if (data?.thumbnail && data?.thumbnail?.path) {
    res.download(data?.thumbnail?.path, data?.thumbnail.name || 'thumbnail.png');
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Thumbnail not found' });
  }
};

export const generateStream: RequestHandler = async (req, res) => {
  const id = req.params.id || '';
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

  return res.status(HttpCode.OK).send({ file });
};
