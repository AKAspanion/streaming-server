/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import mime from 'mime';
import { deleteFile, getResourcePath, makeDirectory } from './helper';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { ffmpegLogger } from './logger';
import { SEGMENT_FILE_NO_SEPERATOR, SEGMENT_TARGET_DURATION } from '@constants/hls';

/* eslint-disable @typescript-eslint/no-var-requires */
export const getffmpeg = () => {
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  const ffmpegProbeInstaller = require('@ffprobe-installer/ffprobe');
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  ffmpeg.setFfprobePath(ffmpegProbeInstaller.path);

  return ffmpeg;
};

export const createVideoThumbnail = (pathToFile: string, filename: string) =>
  new Promise((resolve, reject) => {
    const ffmpeg = getffmpeg();
    const pathToSnapshot = getResourcePath('_appdata/_screenshots');
    const thumbnailFile = `thumb_${filename}.png`;
    const thumbnailPath = path.join(pathToSnapshot, thumbnailFile);

    ffmpeg(pathToFile)
      .on('error', (err: any) => {
        return reject(new Error(err));
      })
      .takeScreenshots(
        { count: 1, filename: thumbnailFile, timemarks: ['00:0:1.000'], size: '250x?' },
        pathToSnapshot,
      )
      .on('end', () => {
        resolve({ path: thumbnailPath, name: thumbnailFile });
      })
      .on('error', (err: any) => {
        return reject(new Error(err));
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
