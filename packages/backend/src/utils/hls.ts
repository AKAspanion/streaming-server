import fs from 'fs';
import { deleteFile, getResourcePath, makeDirectory } from './helper';
import path from 'path';
import {
  SEGMENT_FILE_NO_SEPERATOR,
  SEGMENT_TARGET_DURATION,
  MANIFEST_TEMP_FOLDER,
} from '@constants/hls';
import HLSManager from '@lib/hls-manager';
import { processLogger } from './logger';

export const generateManifest = (id: string, duration: number) =>
  new Promise((resolve, reject) => {
    const manifestFile = `${id}.m3u8`;
    const manifestDir = `${MANIFEST_TEMP_FOLDER}${id}/`;
    const pathToManifest = getResourcePath(manifestDir);
    const outputFile = path.join(pathToManifest, manifestFile);

    deleteFile(outputFile);
    makeDirectory(pathToManifest);

    const targetDuration = SEGMENT_TARGET_DURATION;
    const segments: string[] = [];

    const getSegment = (num: number, dur: number) =>
      `#EXTINF:${dur.toFixed(6)},\n${id}${SEGMENT_FILE_NO_SEPERATOR}${num}.ts`;

    const normalizedDuration = (remainigDuration: number) =>
      remainigDuration < targetDuration ? remainigDuration : targetDuration;

    let index = 0;
    do {
      segments.push(getSegment(index, normalizedDuration(duration)));
      duration -= targetDuration;
      index++;
    } while (duration > 0);

    const manifestfile = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-ALLOW-CACHE:YES
#EXT-X-TARGETDURATION:${targetDuration}
${segments.join('\n')}
#EXT-X-ENDLIST`;

    fs.writeFile(outputFile, manifestfile, (err) => {
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
    mediaId = fileId.split(SEGMENT_FILE_NO_SEPERATOR)[0];
    segment = Number(fileId.split(SEGMENT_FILE_NO_SEPERATOR).pop());
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
    const interval = setInterval(() => {
      if (!hlsManager.isAnyVideoTranscoderActive(group)) {
        processLogger.info('[HLS]Stop checking segemnts, transcoder stopped');
        clearInterval(interval);
        reject();
      }
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err && isSegmentFinished(requestedSegment, hlsManager, group)) {
          clearInterval(interval);
          resolve(true);
        } else if (err) {
          processLogger.info(`[HLS]Couldn't find segment ${requestedSegment}, waiting...`);
        }
      });
    }, 1000);
  });
};

const isSegmentFinished = (requested: number, hlsManager: HLSManager, group: string) => {
  if (hlsManager.isTranscoderFinished(group)) {
    processLogger.info(`[HLS] Transcoder finished`);
    return true;
  }

  const start = hlsManager.getTranscoderStartSegment(group);
  const current = hlsManager.getVideoTranscoderSegment(group);
  if (start == -1) {
    start;
    return false;
  }

  const flag = requested >= start && requested < current + 2;

  processLogger.info(
    `[HLS] Transcoder not finished. requested:${requested} start:${start} current:${current}`,
  );
  return flag;
};
