/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import mime from 'mime';
import { deleteFile, getResourcePath, makeDirectory } from './helper';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { ffmpegLogger } from './logger';
import { SEGMENT_FILE_NO_SEPERATOR, SEGMENT_TARGET_DURATION } from '@constants/hls';
import { secToTime } from './date-time';
import fs from 'fs';

/* eslint-disable @typescript-eslint/no-var-requires */
export const getffmpeg = () => {
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  const ffmpegProbeInstaller = require('@ffprobe-installer/ffprobe');
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  ffmpeg.setFfprobePath(ffmpegProbeInstaller.path);

  return ffmpeg;
};

export const createVideoThumbnail = (id: string, pathToFile: string, metadata: MediaTypeJSONDB) =>
  new Promise<ThumbnailType>((resolve, reject) => {
    const ffmpeg = getffmpeg();
    const pathToSnapshot = getResourcePath(`_appdata/_screenshots/${id}`);
    const thumbnailFile = `thumb_${id}_${metadata?.originalName}.png`;
    const thumbnailPath = path.join(pathToSnapshot, thumbnailFile);

    makeDirectory(pathToSnapshot);

    const time = secToTime(metadata?.format?.duration ? Number(metadata?.format?.duration) / 2 : 2);

    ffmpeg(pathToFile)
      .on('error', (err: any) => {
        return reject(new Error(err));
      })
      .takeScreenshots(
        { count: 1, filename: thumbnailFile, timemarks: [time], size: '250x?' },
        pathToSnapshot,
      )
      .on('end', () => {
        resolve({ path: thumbnailPath, name: thumbnailFile });
      })
      .on('error', (err: any) => {
        return reject(new Error(err));
      });
  });

export const createSeekThumbnail = (id: string, pathToFile: string, time: number) =>
  new Promise<ThumbnailType>((resolve, reject) => {
    const ffmpeg = getffmpeg();
    const pathToSnapshot = getResourcePath(`_appdata/_screenshots/${id}`);
    const thumbnailFile = `thumb_${id}_${time}.jpeg`;
    const thumbnailPath = path.join(pathToSnapshot, thumbnailFile);

    makeDirectory(pathToSnapshot);

    fs.access(thumbnailPath, fs.constants.F_OK, (err) => {
      if (!err) {
        resolve({ path: thumbnailPath, name: thumbnailFile });
      } else {
        ffmpeg(pathToFile)
          .on('start', async (commandLine) => {
            ffmpegLogger.info(`Spawned Ffmpeg with command: ${commandLine})`);
          })
          .takeScreenshots(
            { count: 1, filename: thumbnailFile, timemarks: [time], size: '150x?' },
            pathToSnapshot,
          )
          .on('end', () => {
            resolve({ path: thumbnailPath, name: thumbnailFile });
          })
          .on('error', (err: any) => {
            return reject(new Error(err));
          });
      }
    });
  });

export const getVideoMetaData = (pathToFile: string) =>
  new Promise<MediaTypeJSONDB>((resolve, reject) => {
    const ffmpeg = getffmpeg();

    const mimeType = mime.getType(pathToFile);
    const parsedData = path.parse(pathToFile);
    const originalName = parsedData.name;

    ffmpeg.ffprobe(pathToFile, (err: any, data: any) => {
      if (err) {
        reject(new Error(err));
      }

      resolve({ ...data, originalName, mimeType });
    });
  });

export const createHLSStream = (pathToFile: string, id: string) =>
  new Promise<string>((resolve, reject) => {
    const ffmpeg = getffmpeg();
    const manifestDir = `_hls/${id}`;
    const pathToManifest = getResourcePath(manifestDir);
    const manifestFile = `${id}.m3u8`;
    const outputFile = path.join(pathToManifest, manifestFile);

    deleteFile(outputFile);
    makeDirectory(pathToManifest);

    ffmpeg(pathToFile, { timeout: 432000 })
      .addOptions([
        '-f hls',
        `-hls_time ${SEGMENT_TARGET_DURATION}`,
        '-hls_playlist_type vod',
        '-hls_flags independent_segments',
        '-hls_segment_type mpegts',
        `-hls_segment_filename ${pathToManifest}/${id}${SEGMENT_FILE_NO_SEPERATOR}%01d.ts`,
      ])
      .on('start', function (commandLine) {
        ffmpegLogger.info('Spawned FFmpeg with command: ' + commandLine);
      })
      .on('error', (err: any) => {
        return reject(new Error(err));
      })
      .on('error', function (err, stdout, stderr) {
        ffmpegLogger.info('stderr:\n' + stderr);
      })
      .on('end', () => {
        resolve(outputFile);
      })
      .saveToFile(outputFile);
  });
