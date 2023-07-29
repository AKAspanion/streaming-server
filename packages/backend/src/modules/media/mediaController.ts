/* eslint-disable @typescript-eslint/no-explicit-any */
import { FAST_START_SEGMENTS, SEGMENT_TEMP_FOLDER } from '@constants/hls';
import { getMediaDataDB, pushMediaDB } from '@database/json';
import HLSManager from '@lib/manager';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { createHLSStream, createVideoThumbnail, getVideoMetaData, testFFMPEG } from '@utils/ffmpeg';
import { checkIfFileExists, getFileType } from '@utils/file';
import { deleteDirectory, getResourcePath, makeDirectory } from '@utils/helper';
import { extractHLSFileInfo, generateManifest, getTotalSegments } from '@utils/hls';
import { processLogger } from '@utils/logger';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import fs from 'fs';
import pathLib from 'path';

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
  HLSManager.lock.enter(async function (token) {
    const promises = [];
    let restartTranscoding = false;

    const filePath = pathLib.join(hlsManager.getVideoTranscodingOutputPath(group), file);
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
        const totalSegments = getTotalSegments(duration);
        // Increase the threshold to avoid the situation where the transcoding is being stopped too early because of slow transcodings
        if (segment > latestSegment + 10) {
          // Restart transcoding since seektime is too far away
          processLogger.info(`[HLS] Too long seek`);
          restartTranscoding = true;
        } else if (segment < hlsManager.getTranscodingStartSegment(group) && !segmentExists) {
          // Restart transcoding since seektime is in the past, and that segment does not exist
          processLogger.info(`[HLS] Seeking in the past for a segment that doesn't exist `);
          restartTranscoding = true;
        } else if (
          segment + FAST_START_SEGMENTS / 4 > latestSegment &&
          !hlsManager.isFastSeekingRunning(group) &&
          !hlsManager.isTranscodingFinished(group)
        ) {
          // If we are seeking inside the fast seeking range and fast seek is not running, restart transcoding
          processLogger.info(`[HLS] Seeking inside the fast seeking range `);
          restartTranscoding = true;
        } else if (hlsManager.isTranscodingFinished(group)) {
          try {
            fs.accessSync(filePath, fs.constants.F_OK);
            processLogger.info(`[HLS] Process finished and segment`);
          } catch (err) {
            processLogger.info(`[HLS] Process finished but segment not found, restarting`);
            restartTranscoding = true;
          }
        }
        processLogger.info(
          `Segments (total: ${totalSegments}, current ${latestSegment}, requested: ${segment}). Restarting at ${startSegment}`,
        );

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

    const startedNewTranscoding = promises.length > 0;
    Promise.all(promises).then((data) => {
      processLogger.info('promises done ' + data);
      processLogger.info('Checking for path ' + filePath);
      const waitForSegment = startedNewTranscoding ? segment + 2 : segment;
      waitUntilFileExists(filePath, waitForSegment, hlsManager, group)
        .then(() => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.status(HttpCode.OK).download(filePath);
        })
        .catch(() => {
          const message = `[HLS] Transcoding was stopped for group ${group}`;
          processLogger.info(message);
          throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: message });
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
    const interval = setInterval(() => {
      // Stop checking if the transcoding stopped
      if (!hlsManager.isAnyVideoTranscodingActive(group)) {
        processLogger.info('Stop checking if the transcoding stopped');
        clearInterval(interval);
        reject();
      }
      fs.access(filePath, fs.constants.F_OK, (err) => {
        // If isSegmentFinished returned false because the transcoding isn't running we will
        // stop the loop at the next interval (isAnyVideoTranscodingActive will be false)
        if (!err && isSegmentFinished(requestedSegment, hlsManager, group)) {
          processLogger.info('Found file, returning to server' + filePath);
          clearInterval(interval);
          resolve(true);
        } else if (err) {
          processLogger.info("Couldn't access " + filePath) + ', waiting for it to be ready...';
        }
      });
    }, 500);
  });
};

const isSegmentFinished = (requested: number, hlsManager: HLSManager, group: string) => {
  if (hlsManager.isTranscodingFinished(group)) {
    processLogger.info('Transcoding finished', group);
    return true;
  }
  const start = hlsManager.getTranscodingStartSegment(group);
  const current = hlsManager.getVideoTranscodingSegment(group);
  processLogger.info(`Segment Finished check: `);
  processLogger.info(`Start#${start} Current#${current} Requested#${requested}`);
  if (start == -1) {
    start;
    // No transcoding was found, return false
    return false;
  }
  return requested >= start && requested < current + 2;
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
