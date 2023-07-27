/* eslint-disable @typescript-eslint/no-explicit-any */

import mime from 'mime';
import { deleteFile, getResourcePath, makeDirectory } from './helper';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { MPEGTS_FILE_NO_SEPERATOR, MPEGTS_TARGET_DURATION } from '@constants/app';
import { secToTime } from './date-time';

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
        `-hls_time ${MPEGTS_TARGET_DURATION}`,
        '-hls_playlist_type vod',
        '-hls_flags independent_segments',
        '-hls_segment_type mpegts',
        `-hls_segment_filename ${pathToManifest}/${id}${MPEGTS_FILE_NO_SEPERATOR}%01d.ts`,
      ])
      .on('start', function (commandLine) {
        console.log('Spawned FFmpeg with command: ' + commandLine);
      })
      .on('error', (err: any) => {
        return reject(new Error(err));
      })
      .on('error', function (err, stdout, stderr) {
        console.log('stderr:\n' + stderr);
      })
      .on('end', () => {
        resolve(outputFile);
      })
      .saveToFile(outputFile);
  });

export const createHLSSegment = (
  pathToFile: string,
  options: { mediaId: string; segmentNo: number },
) =>
  new Promise<string>((resolve, reject) => {
    const { segmentNo, mediaId } = options;

    // const videoDuration = duration; //microseconds

    const ffmpeg = getffmpeg();
    const segementsDir = `_hls/${mediaId}`;
    const pathToSegments = getResourcePath(segementsDir);
    const segmentFile = `${mediaId}${MPEGTS_FILE_NO_SEPERATOR}%d.ts`;
    const segmentListFile = `${pathToSegments}/${mediaId}.m3u8`;
    const segmentTempPath = path.join(pathToSegments, segmentFile);

    makeDirectory(pathToSegments);
    deleteFile(segmentTempPath);

    // const normalizedtime = (t: number) => (t > videoDuration ? videoDuration : t).toFixed(6);

    // let toTime = MPEGTS_TARGET_DURATION * (segmentNo + 1);
    // const startTime = MPEGTS_TARGET_DURATION * segmentNo;
    // // const elapseTime = toTime > videoDuration ? videoDuration - startTime : MPEGTS_TARGET_DURATION;
    // const muxDelay = segmentNo <= 0 ? segmentNo : startTime / 2;

    // toTime = toTime > videoDuration ? videoDuration : toTime;
    // const convertOptions: string[] = [
    //   '-y',
    //   segmentNo ? `-ss ${startTime.toFixed(6)}` : '',
    //   `-to ${toTime.toFixed(6)}`,
    //   '-map 0',
    //   '-c copy',
    //   '-c:a aac',
    //   segmentNo ? `-muxdelay ${muxDelay}` : '',
    //   segmentNo ? `-muxpreload ${muxDelay}` : '',
    // ].filter(Boolean);

    // ffmpeg(pathToFile, { timeout: 432000 })
    //   .addOptions(convertOptions)
    //   .output(segmentPath)
    //   .on('start', function (commandLine) {
    //     console.log('Spawned FFmpeg with command: ' + commandLine);
    //   })
    //   .on('end', () => {
    //     resolve(segmentPath);
    //   })
    //   .on('error', (err: any) => {
    //     return reject(new Error(err));
    //   })
    //   .on('error', function (err, stdout, stderr) {
    //     console.log('stderr:\n' + stderr);
    //   })
    //   .run();

    ffmpeg(pathToFile, { timeout: 432000 })
      .addOptions([
        '-y',
        '-copyts',
        '-start_at_zero',
        `-ss ${secToTime(segmentNo * MPEGTS_TARGET_DURATION)}`,
        '-map 0',
        '-c copy',
        '-c:a aac',
        '-preset:v:0 veryfast',
        '-max_delay 5000000',
        '-avoid_negative_ts disabled',
        '-f segment',
        '-map_metadata -1',
        '-map_chapters -1',
        '-segment_format mpegts',
        `-segment_list ${segmentListFile}`,
        '-segment_list_type m3u8',
        `-segment_time ${secToTime(MPEGTS_TARGET_DURATION)}`,
        `-segment_start_number ${segmentNo}`,
        '-individual_header_trailer 0',
        '-write_header_trailer 0',
      ])
      .output(segmentTempPath)
      .on('start', function (commandLine) {
        console.log('Spawned FFmpeg with command: ' + commandLine);
      })
      .on('end', () => {
        resolve(segmentTempPath);
      })
      .on('error', (err: any) => {
        return reject(new Error(err));
      })
      .on('error', function (err, stdout, stderr) {
        console.log('stderr:\n' + stderr);
      })
      .run();
  });
