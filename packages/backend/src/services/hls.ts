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
  audioStream: number;
  duration: number;
};

export const processHLSStream = (options: ProcessStreamOptions) => {
  const { audioStream, videoPath, hlsManager, group, startSegment, segment, file, duration } =
    options;
  return new Promise<string>((resolve, reject) => {
    (async () => {
      const promises = [];
      let restartTranscoder = false;

      const filePath = pathLib.join(hlsManager.getVideoTranscoderOutputPath(group), file);

      if (!hlsManager.isAnyVideoTranscoderActive(group)) {
        restartTranscoder = true;
      } else {
        if (!hlsManager.isSameAudioStream(group, audioStream)) {
          // Stop other transcoders (other qualities) if they are running
          processLogger.info(`[HLS]Stop other transcoders if different audio`);
          restartTranscoder = true;
        } else {
          const path = pathLib.join(hlsManager.getVideoTranscoderOutputPath(group), file);
          const segmentExists = await checkIfFileExists(path);

          const latestSegment = hlsManager.getVideoTranscoderSegment(group);
          // Increase the threshold to avoid the situation where the transcoder is being stopped too early because of slow transcoders
          if (segment > latestSegment + 10) {
            // Restart transcoder since seek time is too far away
            processLogger.info(`[HLS] Too long seek`);
            restartTranscoder = true;
          } else if (segment < hlsManager.getTranscoderStartSegment(group) && !segmentExists) {
            // Restart transcoder since seek time is in the past, and that segment does not exist
            processLogger.info(`[HLS] Seeking in the past for a segment that doesn't exist `);
            restartTranscoder = true;
          } else if (hlsManager.isTranscoderFinished(group)) {
            try {
              fsLib.accessSync(filePath, fsLib.constants.F_OK);
            } catch (err) {
              processLogger.info(`[HLS] Process finished but segment not found`);
              restartTranscoder = true;
            }
          }

          // If restartTranscoder is true in here, we need to stop the other transcoders
          // Since we are either seeking far in the future, in the past or inside the fast seeking range
          if (restartTranscoder) {
            hlsManager.stopAllVideoTranscoder(group);
          }
        }
      }

      if (restartTranscoder) {
        promises.push(
          hlsManager.startTranscoder(videoPath, startSegment, audioStream, group, duration),
        );
      }

      const startedNewTranscoder = promises.length > 0;
      Promise.all(promises).then(() => {
        const totalSegment = getTotalSegments(duration);
        const lookaheadSegment = segment + 2 > totalSegment ? totalSegment : segment + 2;
        const waitForSegment = startedNewTranscoder ? lookaheadSegment : segment;
        waitUntilFileExists(filePath, waitForSegment, hlsManager, group)
          .then(() => {
            // processLogger.info(`[HLS]Found segment ${waitForSegment}, returning to server`);
            resolve(filePath);
          })
          .catch(() => {
            // processLogger.error(`[HLS] Transcoder was stopped`);
            reject(new Error(`[HLS] Transcoder was stopped for group ${group}`));
          });
      });
    })();
  });
};
