/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FAST_START_SEGMENTS,
  SEGMENT_FILE_NO_SEPERATOR,
  SEGMENT_TEMP_FOLDER,
} from '@constants/hls';
import { getMediaDataDB, pushMediaDB } from '@database/json';
import HLSManager from '@lib/manager';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { createHLSStream, createVideoThumbnail, getVideoMetaData, testFFMPEG } from '@utils/ffmpeg';
import { checkIfFileExists, getFileType } from '@utils/file';
import { deleteDirectory, getResourcePath, makeDirectory } from '@utils/helper';
import { generateManifest } from '@utils/hls';
import { processLogger } from '@utils/logger';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import fs from 'fs';
import pathLib from 'path';

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

  const ext = file.split('.').pop();
  const fileId = file.split('.')[0];

  if (ext !== 'm3u8' && ext !== 'ts') {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Not a HLS request' });
  }

  const hlsPath = getResourcePath(SEGMENT_TEMP_FOLDER + fileId);
  const urlFilePath = `${hlsPath}/${file}`;

  if (ext === 'm3u8') {
    return res.download(urlFilePath);
  }

  const mediaId = fileId.split(SEGMENT_FILE_NO_SEPERATOR)[0];
  const segment = Number(fileId.split(SEGMENT_FILE_NO_SEPERATOR).pop());

  const { data, error } = await getMediaDataDB<MediaTypeJSONDB>(`/${mediaId}`);

  if (error) {
    handleJSONDBDataError(error, mediaId);
  }

  if (!data?.format?.filename) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }

  const hlsManager = new HLSManager();
  const audioStream = 1;
  const group = mediaId;

  hlsManager.setLastRequestedTime(group);

  const videoPath = data?.format?.filename;

  // return new Promise<boolean>((resolve) => {
  const startSegment = Math.max(segment - 1, 0);

  // Should be lock per group somehow
  HLSManager.lock.enter(async function (token) {
    const promises = [];
    let restartTranscoding = false;

    processLogger.info(`Started processing of segment no ${segment}`);

    if (!hlsManager.isAnyVideoTranscodingActive(group)) {
      restartTranscoding = true;
    } else {
      if (hlsManager.stopOtherVideoTranscodings(group)) {
        // Stop other transcodings (other qualities) if they are running
        processLogger.info(`Stop other transcodings if they are running`);
        restartTranscoding = true;
      } else {
        const path = pathLib.join(hlsManager.getVideoTranscodingOutputPath(group), file);
        const segmentExists = await checkIfFileExists(path);

        const latestSegment = hlsManager.getVideoTranscodingSegment(group);
        // Increase the threshold to avoid the situation where the transcoding is being stopped too early because of slow transcodings
        if (segment > latestSegment + 10) {
          // Restart transcoding since seektime is too far away
          processLogger.info(
            `[HLS] Too long seek (current segment: ${latestSegment}, requested segment: ${segment}). Restarting at ${startSegment}`,
          );
          restartTranscoding = true;
        } else if (segment < hlsManager.getTranscodingStartSegment(group) && !segmentExists) {
          // Restart transcoding since seektime is in the past, and that segment does not exist
          processLogger.info(
            `[HLS] Seeking in the past for a segment that doesn't exist (current segment: ${latestSegment}, requested segment: ${segment}). Restarting at ${startSegment}`,
          );
          restartTranscoding = true;
        } else if (
          segment + FAST_START_SEGMENTS / 4 > latestSegment &&
          !hlsManager.isFastSeekingRunning(group) &&
          !hlsManager.isTranscodingFinished(group)
        ) {
          // If we are seeking inside the fast seeking range and fast seek is not running, restart transcoding
          processLogger.info(
            `[HLS] Seeking inside the fast seeking range (current segment: ${latestSegment}, requested segment: ${segment}). Restarting at ${startSegment}`,
          );
          restartTranscoding = true;
        }

        // If restartTranscoding is true in here, we need to stop the other transcodings
        // Since we are either seeking far in the future, in the past or inside the fast seeking range
        if (restartTranscoding) {
          hlsManager.stopAllVideoTranscodings(group);
        }
      }
    }

    if (restartTranscoding) {
      promises.push(hlsManager.startTranscoding(videoPath, startSegment, audioStream, group));
    }

    //requestedSegment, startSegment, lastSegment, isTranscodingFinished
    const startedNewTranscoding = promises.length > 0;
    Promise.all(promises).then((data) => {
      processLogger.info('promises done ' + data);
      const filePath = pathLib.join(hlsManager.getVideoTranscodingOutputPath(group), file);
      processLogger.info('Checking for path ' + filePath);
      const waitForSegment = startedNewTranscoding ? segment + 2 : segment;
      waitUntilFileExists(filePath, waitForSegment, hlsManager, group)
        .then(() => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.status(HttpCode.OK).download(filePath);
        })
        .catch(() => {
          // Transcoding was stopped
          processLogger.info(
            `[HLS] Transcoding was stopped for group ${group}, not waiting for segment anymore`,
          );
          throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Media not found' });
        });
      HLSManager.lock.leave(token);
    });
  });
};

const waitUntilFileExists = (
  filePath: string,
  requestedSegment: number,
  hlsManager: HLSManager,
  group: string,
) => {
  return new Promise((resolve, reject) => {
    processLogger.info('Started Looking for file');
    const interval = setInterval(() => {
      // Stop checking if the transcoding stopped
      if (!hlsManager.isAnyVideoTranscodingActive(group)) {
        processLogger.info('Stop checking if the transcoding stopped');
        clearInterval(interval);
        reject();
      }
      fs.access(filePath, fs.constants.F_OK, (err) => {
        processLogger.info('File accesing' + filePath);
        // If isSegmentFinished returned false because the transcoding isn't running we will
        // stop the loop at the next interval (isAnyVideoTranscodingActive will be false)
        if (!err && isSegmentFinished(requestedSegment, hlsManager, group)) {
          clearInterval(interval);
          resolve(true);
        } else if (err) {
          processLogger.info("Couldn't access " + filePath) + ', waiting for it to be ready...';
        }
      });
    }, 500);
  });
};

const isSegmentFinished = (requestedSegment: number, hlsManager: HLSManager, group: string) => {
  if (hlsManager.isTranscodingFinished(group)) {
    processLogger.info('Transcoding finished', group);
    return true;
  }
  const startSegment = hlsManager.getTranscodingStartSegment(group);
  const currentSegment = hlsManager.getVideoTranscodingSegment(group);
  processLogger.info(
    `isSegmentFinished startSegment#${startSegment} currentSegment#${currentSegment} requestedSegment#${requestedSegment}`,
  );
  if (startSegment == -1) {
    // No transcoding was found, return false
    return false;
  }
  return (
    requestedSegment >= hlsManager.getTranscodingStartSegment(group) &&
    requestedSegment < hlsManager.getVideoTranscodingSegment(group) + 2
  );
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

  const data = await testFFMPEG(file);

  return res.status(HttpCode.OK).send({ data });
};
