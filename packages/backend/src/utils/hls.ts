import fs from 'fs';
import { deleteFile, getResourcePath, makeDirectory } from './helper';
import path from 'path';
import {
  SEGMENT_FILE_NO_SEPARATOR,
  SEGMENT_TARGET_DURATION,
  MANIFEST_TEMP_FOLDER,
} from '@constants/hls';
import HLSManager from '@lib/hls-manager';
import { processLogger } from './logger';
import { sleep } from '@common/utils/func';

export const generateManifest = (
  id: string,
  duration: number,
  token: string,
  resolution?: number,
) =>
  new Promise((resolve, reject) => {
    const file = `${id}.m3u8`;
    const manifestDir = `${MANIFEST_TEMP_FOLDER}${id}/`;
    const pathToManifest = getResourcePath(manifestDir);
    const outputFile = path.join(pathToManifest, file);

    deleteFile(outputFile);
    makeDirectory(pathToManifest);

    const targetDuration = SEGMENT_TARGET_DURATION;
    const segments: string[] = [];

    const getSegment = (num: number, dur: number) =>
      `#EXTINF:${dur.toFixed(
        6,
      )},\n${id}${SEGMENT_FILE_NO_SEPARATOR}${num}.ts?token=${token}&resolution=${
        resolution || '720'
      }`;

    const normalizedDuration = (remainingDuration: number) =>
      remainingDuration < targetDuration ? remainingDuration : targetDuration;

    let index = 0;
    do {
      segments.push(getSegment(index, normalizedDuration(duration)));
      duration -= targetDuration;
      index++;
    } while (duration > 0);

    const manifestFile = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-ALLOW-CACHE:YES
#EXT-X-TARGETDURATION:${targetDuration}
${segments.join('\n')}
#EXT-X-ENDLIST`;

    fs.writeFile(outputFile, manifestFile, (err) => {
      if (err) {
        reject(err);
      }

      resolve(true);
    });
  });

export const getTotalSegments = (duration: number) => {
  const targetDuration = SEGMENT_TARGET_DURATION;
  let index = 0;
  do {
    duration -= targetDuration;
    index++;
  } while (duration > 0);

  return index - 1;
};

export const extractHLSFileInfo = (filename: string) => {
  const ext = filename.split('.').pop();
  const fileId = filename.split('.')[0];
  let mediaId = '';
  let segment = 0;

  const isTS = ext === 'ts';
  const ism3u8 = ext === 'm3u8';
  const isInvalid = ext !== 'm3u8' && ext !== 'ts';

  if (isTS) {
    mediaId = fileId.split(SEGMENT_FILE_NO_SEPARATOR)[0];
    segment = Number(fileId.split(SEGMENT_FILE_NO_SEPARATOR).pop());
  }

  if (ism3u8) {
    mediaId = fileId;
  }

  return { ext, mediaId, segment, isTS, ism3u8, isInvalid };
};

export const sortHLSFiles = (filenames: string[]) => {
  return filenames.sort();
};

export const waitUntilFileExists = (
  filePath: string,
  requestedSegment: number,
  hlsManager: HLSManager,
  group: string,
) => {
  return new Promise((resolve, reject) => {
    const waitForFile = async (count: number) => {
      processLogger.info(`[HLS]Waiting for segment "${requestedSegment}"`);
      await sleep(250);

      if (count >= 20) {
        processLogger.info('[HLS]Stop checking segments, retries exceeded');
        reject();
        return;
      }

      if (!hlsManager.isAnyVideoTranscoderActive(group)) {
        processLogger.info('[HLS]Stop checking segments, transcoder stopped');
        reject();
        return;
      }
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err && isSegmentFinished(requestedSegment, hlsManager, group)) {
          resolve(true);
          return;
        } else {
          waitForFile(++count);
        }
      });
    };

    waitForFile(1);
  });
};

const isSegmentFinished = (requested: number, hlsManager: HLSManager, group: string) => {
  if (hlsManager.isTranscoderFinished(group)) {
    return true;
  }

  const start = hlsManager.getTranscoderStartSegment(group);
  const current = hlsManager.getVideoTranscoderSegment(group);

  processLogger.info(
    `[HLS]Transcoder not finished. requested:${requested} start:${start} current:${current}`,
  );

  if (start == -1) {
    start;
    return false;
  }

  const flag = requested >= start && requested < current + 2;

  return flag;
};
