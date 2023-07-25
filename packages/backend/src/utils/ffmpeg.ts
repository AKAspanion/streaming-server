/* eslint-disable @typescript-eslint/no-explicit-any */

import mime from 'mime';
import { getResourcePath } from './helper';
import path from 'path';

/* eslint-disable @typescript-eslint/no-var-requires */
export const getffmpeg = () => {
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  const ffmpegProbeInstaller = require('@ffprobe-installer/ffprobe');
  const ffmpeg = require('fluent-ffmpeg');
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  ffmpeg.setFfprobePath(ffmpegProbeInstaller.path);

  return ffmpeg;
};

export const createVideoThumbnail = (pathToFile: string, filename: string) =>
  new Promise((resolve, reject) => {
    const ffmpeg = getffmpeg();
    const pathToSnapshot = getResourcePath('_screenshots');
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
        resolve({ thumbnailPath, name: thumbnailFile });
      })
      .on('error', (err: any) => {
        return reject(new Error(err));
      });
  });

export const readVideoMetaData = (pathToFile: string) =>
  new Promise<MediaTypeJSONDB>((resolve, reject) => {
    const ffmpeg = getffmpeg();

    const mimeType = mime.getType(pathToFile);
    const parsedData = path.parse(pathToFile);
    const originalName = parsedData.name;

    ffmpeg.ffprobe(pathToFile, (err: any, data: any) => {
      if (err) {
        reject(new Error(err));
      }

      resolve({ ...data, parsedData, originalName, mimeType });
    });
  });
