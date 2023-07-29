import fs from 'fs';
import { deleteFile, getResourcePath, makeDirectory } from './helper';
import path from 'path';
import {
  SEGMENT_FILE_NO_SEPERATOR,
  SEGMENT_TARGET_DURATION,
  SEGMENT_TEMP_FOLDER,
} from '@constants/hls';
import HLSManager from '@lib/hls-manager';
import { processLogger } from './logger';

export const generateManifest = (id: string, duration: number) => {
  const manifestFile = `${id}.m3u8`;
  const manifestDir = `${SEGMENT_TEMP_FOLDER}${id}/`;
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

  fs.writeFileSync(outputFile, manifestfile);
};

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
