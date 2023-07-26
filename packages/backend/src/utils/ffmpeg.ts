/* eslint-disable @typescript-eslint/no-explicit-any */

import mime from 'mime';
import { getResourcePath, makeDirectory } from './helper';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

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
        resolve({ path: thumbnailPath, name: thumbnailFile });
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

      resolve({ ...data, originalName, mimeType });
    });
  });

export const createHLS = (pathToFile: string, filename: string) =>
  new Promise<boolean>((resolve, reject) => {
    const ffmpeg = getffmpeg();
    const pathToHLS = getResourcePath('_hls');
    const hlsFile = `hls_${filename}.m3u8`;
    const hlsPath = path.join(pathToHLS, hlsFile);

    makeDirectory('_hls');

    ffmpeg(pathToFile, { timeout: 432000 })
      .addOptions([
        '-profile:v baseline',
        '-level 3.0',
        '-start_number 0',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls',
      ])
      .output(hlsPath)
      .on('end', () => {
        resolve(true);
      })
      .on('error', (err: any) => {
        return reject(new Error(err));
      })
      .on('error', function (err, stdout, stderr) {
        console.log(err.message); //this will likely return "code=1" not really useful
        console.log('stdout:\n' + stdout);
        console.log('stderr:\n' + stderr); //this will contain more detailed debugging info
      })
      .run();
  });
