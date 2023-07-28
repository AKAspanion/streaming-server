/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import mime from 'mime';
import { deleteFile, getResourcePath, makeDirectory, sleep } from './helper';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { secToTime } from './date-time';
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
    const segmentFile = `${mediaId}${SEGMENT_FILE_NO_SEPERATOR}%d.ts`;
    const pathToTemp = path.join(pathToSegments, 'temp');
    const segmentListFile = path.join(pathToTemp, `${mediaId}.m3u8`);
    const segmentTempPath = path.join(pathToTemp, segmentFile);

    makeDirectory(pathToTemp);
    deleteFile(segmentTempPath);

    ffmpeg(pathToFile, { timeout: 432000 })
      .addOptions(
        [
          '-y',
          '-copyts',
          '-start_at_zero',
          segmentNo ? '' : `-ss ${secToTime(segmentNo * SEGMENT_TARGET_DURATION)}`,
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
          `-segment_time ${secToTime(SEGMENT_TARGET_DURATION)}`,
          `-segment_start_number ${segmentNo}`,
        ].filter(Boolean),
      )
      .output(segmentTempPath)
      .on('start', function (commandLine) {
        ffmpegLogger.info('Spawned FFmpeg with command: ' + commandLine);
      })
      .on('codecData', async function () {
        await sleep(1000);
        resolve(segmentTempPath.replace('%d.ts', `${segmentNo}.ts`));
      })
      .on('error', (err: any) => {
        return reject(new Error(err));
      })
      .on('error', function (err, stdout, stderr) {
        ffmpegLogger.info('stderr:\n' + stderr);
      })
      .run();
  });

export const testFFMPEG = (pathToFile: string) =>
  new Promise<string>((resolve, reject) => {
    // executeFfmpeg(`ffmpeg -i ${pathToFile} -hls_time 20 -hls_flags single_file _hls/out.m3u8`)

    const ffmpeg = getffmpeg();
    ffmpeg(pathToFile, { timeout: 432000 })
      .addOptions([
        // '-loglevel +timing',
        '-y',
        // '-print_graphs_file _hls/graphs.txt',
        '-copyts',
        '-start_at_zero',
        // '-f matroska,webm',
        // '-noaccurate_seek',
        // '-c:v:0 hevc',
        // '-c:v:1 mjpeg',
        // "-i 'D:\\Downloads\\Shingeki No Kyojin Full Collection\\Shingeki no Kyojin S01 1080p BDRip 10 bits x265-EMBER\\S01E23- Smile [C2877D8D].mkv'",
        '-map 0',
        '-c copy',
        '-c:a copy',
        // '-map 0:0',
        // '-map 0:1',
        // '-sn',
        // '-c:v:0 copy',
        // '-bsf:v:0 hevc_mp4toannexb',
        // '-c:a:0 libmp3lame',
        // '-ab:a:0 192000',
        // '-ac:a:0 2',
        '-metadata:s:a:0 language=eng',
        // "-filter:a:0 'volume=2'",
        '-disposition:a:0 default',
        '-max_delay 5000000',
        '-avoid_negative_ts disabled',
        '-f hls',
        '-map_metadata -1',
        '-map_chapters -1',
        // '-vtag hvc1',
        '-start_number 0',
        '-hls_time 6',
        '-hls_list_size 0',
        `-hls_segment_filename _hls/AE6D23_%d.m4s`,
        '-hls_segment_type fmp4',
        '-hls_fmp4_init_filename AE6D23_init.mp4',
        '-hls_flags +temp_file+split_by_time',
        '-hls_playlist_type vod',
      ])
      .saveToFile('_hls/AE6D23.m3u8')
      .on('end', () => ffmpegLogger.info('end'))
      .on('start', (commandLine: any) => ffmpegLogger.info('start', commandLine))
      .on('codecData', (codecData: any) => resolve(codecData))
      .on('error', (error: any) => ffmpegLogger.info('error', error))
      .on('error', (error: any) => reject(error))
      .run();
  });

export const executeFfmpeg = (args: any) => {
  const fluent = getffmpeg();
  const command = fluent().output(' '); // pass "Invalid output" validation
  // @ts-ignore
  command._outputs[0].isFile = false; // disable adding "-y" argument
  // @ts-ignore
  command._outputs[0].target = ''; // bypass "Unable to find a suitable output format for ' '"
  // @ts-ignore
  command._global.get = () => {
    // append custom arguments
    return typeof args === 'string' ? args.split(' ') : args;
  };
  return command;
};

// https://stackoverflow.com/questions/70460979/how-do-i-create-an-hls-master-playlist-with-ffmpeg
// -hide_banner -re -i input.mp4 -map 0:v:0 -map 0:a:0 -map 0:v:0 -map 0:a:0 -map 0:v:0 -map 0:a:0 -map 0:v:0 -map 0:a:0 \
// -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -c:a aac -ar 48000 \
// -filter:v:0 scale=w=640:h=360:force_original_aspect_ratio=decrease -maxrate:v:0 856k -bufsize:v:0 1200k -b:a:0 96k \
// -filter:v:1 scale=w=842:h=480:force_original_aspect_ratio=decrease -maxrate:v:1 1498k -bufsize:v:1 2100k -b:a:1 128k \
// -filter:v:2 scale=w=1280:h=720:force_original_aspect_ratio=decrease -maxrate:v:2 2996k -bufsize:v:2 4200k -b:a:2 128k \
// -filter:v:3 scale=w=1920:h=1080:force_original_aspect_ratio=decrease -maxrate:v:3 5350k -bufsize:v:3 7500k -b:a:3 192k \
// -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3" \
// -hls_time 4 \
// -hls_list_size 0 \
// -master_pl_name master.m3u8 \
// -hls_segment_filename output/%v_%03d.ts output/%v.m3u8
