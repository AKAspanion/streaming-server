import { FAST_START_SEGMENTS } from '@constants/hls';
import HLSManager from '@lib/hls-manager';
import { checkIfFileExists } from '@utils/file';
import { getTotalSegments, waitUntilFileExists } from '@utils/hls';
import { processLogger } from '@utils/logger';
import pathLib from 'path';
import fsLib from 'fs';

type ProcessStreamOptions = {
  videoPath: string;
  hlsManager: HLSManager;
  group: string;
  startSegment: number;
  segment: number;
  file: string;
  duration: number;
  audioStream: number;
};

export const processHLSStream = (options: ProcessStreamOptions) => {
  const { audioStream, videoPath, hlsManager, group, startSegment, segment, file, duration } =
    options;
  return new Promise<string>((resolve, reject) => {
    HLSManager.lock.enter(async function (token) {
      const promises = [];
      let restartTranscoder = false;

      const filePath = pathLib.join(hlsManager.getVideoTranscoderOutputPath(group), file);
      processLogger.info(`Started processing of segment no ${segment}`);

      if (!hlsManager.isAnyVideoTranscoderActive(group)) {
        restartTranscoder = true;
      } else {
        if (hlsManager.stopOtherVideoTranscoders(group)) {
          // Stop other transcoders (other qualities) if they are running
          processLogger.info(`Stop other transcoders if they are running`);
          restartTranscoder = true;
        } else {
          const path = pathLib.join(hlsManager.getVideoTranscoderOutputPath(group), file);
          const segmentExists = await checkIfFileExists(path);

          const latestSegment = hlsManager.getVideoTranscoderSegment(group);
          const totalSegments = getTotalSegments(duration);
          // Increase the threshold to avoid the situation where the transcoder is being stopped too early because of slow transcoders
          if (segment > latestSegment + 10) {
            // Restart transcoder since seektime is too far away
            processLogger.info(`[HLS] Too long seek`);
            restartTranscoder = true;
          } else if (segment < hlsManager.getTranscoderStartSegment(group) && !segmentExists) {
            // Restart transcoder since seektime is in the past, and that segment does not exist
            processLogger.info(`[HLS] Seeking in the past for a segment that doesn't exist `);
            restartTranscoder = true;
          } else if (
            segment + FAST_START_SEGMENTS / 4 > latestSegment &&
            !hlsManager.isFastSeekingRunning(group) &&
            !hlsManager.isTranscoderFinished(group)
          ) {
            // If we are seeking inside the fast seeking range and fast seek is not running, restart transcoder
            processLogger.info(`[HLS] Seeking inside the fast seeking range `);
            restartTranscoder = true;
          } else if (hlsManager.isTranscoderFinished(group)) {
            try {
              fsLib.accessSync(filePath, fsLib.constants.F_OK);
              processLogger.info(`[HLS] Process finished and segment`);
            } catch (err) {
              processLogger.info(`[HLS] Process finished but segment not found, restarting`);
              restartTranscoder = true;
            }
          }
          processLogger.info(
            `Segments (total: ${totalSegments}, current ${latestSegment}, requested: ${segment}, Restarting at ${startSegment}`,
          );

          // If restartTranscoder is true in here, we need to stop the other transcoders
          // Since we are either seeking far in the future, in the past or inside the fast seeking range
          if (restartTranscoder) {
            hlsManager.stopAllVideoTranscoders(group);
          }
        }
      }

      if (restartTranscoder) {
        promises.push(hlsManager.startTranscoder(videoPath, startSegment, audioStream, group));
      }

      const startedNewTranscoder = promises.length > 0;
      Promise.all(promises).then((data) => {
        processLogger.info('promises done ' + data);
        processLogger.info('Checking for path ' + filePath);
        const waitForSegment = startedNewTranscoder ? segment + 2 : segment;
        waitUntilFileExists(filePath, waitForSegment, hlsManager, group)
          .then(() => {
            // res.setHeader('Access-Control-Allow-Origin', '*');
            // res.setHeader('Access-Control-Allow-Headers', '*');
            // res.status(HttpCode.OK).download(filePath);
            resolve(filePath);
          })
          .catch(() => {
            const message = `[HLS] Transcoder was stopped for group ${group}`;
            processLogger.info(message);
            reject(new Error(message));
            // throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: message });
          });
        HLSManager.lock.leave(token);
      });
    });
  });
};
