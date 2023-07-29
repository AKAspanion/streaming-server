/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

import { ffmpegLogger, processLogger } from '@utils/logger';
import TranscoderGroup from './transcoder-group';
import { AsyncLock } from 'node-async-locks';
import Transcoder from './transcoder';
import { SEGMENT_TEMP_FOLDER } from '@constants/hls';
// import { FAST_START_TIME, SEGMENT_TARGET_DURATION } from '@constants/hls';

declare global {
  var transcoders: TranscoderGroup[] | undefined;
}

export default class HLSManager {
  static lock = new AsyncLock();

  constructor() {
    if (!globalThis.transcoders) {
      globalThis.transcoders = [];
    }
  }

  setLastRequestedTime(group: string) {
    if (!global.transcoders || !global.transcoders.length) return;
    for (let i = 0; i < global.transcoders.length; i++) {
      if (global.transcoders[i].group === group) {
        global.transcoders[i].updateLastRequestedTime();
      }
    }
  }

  isAnyVideoTranscodingActive(group: string) {
    if (!global.transcoders || !global.transcoders.length) return;
    return global.transcoders.some((t) => t.group === group);
  }

  static stopOtherVideotranscoders(group: string) {
    if (!global.transcoders || !global.transcoders.length) return;
    let i = global.transcoders.length;
    let anythingStopped = false;
    while (i--) {
      if (global.transcoders[i].group == group) {
        global.transcoders[i].stop();
        global.transcoders.splice(i, 1);
        anythingStopped = true;
      }
    }
    return anythingStopped;
  }

  getVideoTranscodingOutputPath(group: string) {
    if (!global.transcoders || !global.transcoders.length) return `${SEGMENT_TEMP_FOLDER}/${group}`;
    const transcoder = global.transcoders.find((transcoding) => transcoding.group === group);
    return transcoder ? transcoder.getOutputFolder() : `${SEGMENT_TEMP_FOLDER}/${group}`;
  }

  isTranscodingFinished(group: string) {
    if (!global.transcoders || !global.transcoders.length) return;
    const transcoding = global.transcoders.find((transcoding) => transcoding.group === group);
    if (transcoding == undefined) return false;
    return transcoding.isTranscodingFinished();
  }

  getTranscodingStartSegment(group: string) {
    if (!global.transcoders || !global.transcoders.length) return -1;
    const transcoding = global.transcoders.find((transcoding) => transcoding.group === group);
    if (transcoding == undefined) return -1;
    return transcoding.getStartSegment();
  }

  getVideoTranscodingSegment(group: string) {
    if (!global.transcoders || !global.transcoders.length) return -1;
    const transcoding = global.transcoders.find((transcoding) => transcoding.group === group);
    if (transcoding == undefined) return -1;
    return transcoding.getLatestSegment();
  }

  stopOtherVideoTranscodings(group: string) {
    if (!global.transcoders || !global.transcoders.length) return;
    let i = global.transcoders.length;
    let anythingStopped = false;
    while (i--) {
      if (global.transcoders[i].group !== group) {
        global.transcoders[i].stop();
        global.transcoders.splice(i, 1);
        anythingStopped = true;
      }
    }
    return anythingStopped;
  }

  isFastSeekingRunning(group: string) {
    if (!global.transcoders || !global.transcoders.length) return;
    return global.transcoders.some(
      (transcoding) => transcoding.group === group && transcoding.isFastStartRunning(),
    );
  }

  stopAllVideoTranscodings(group: string) {
    if (!global.transcoders || !global.transcoders.length) return;
    let i = global.transcoders.length;
    let stopped = 0;
    while (i--) {
      if (global.transcoders[i].group == group) {
        global.transcoders[i].stop();
        global.transcoders.splice(i, 1);
        stopped++;
        if (stopped > 1) {
          ffmpegLogger.warn(`[HLS] Stopped ${stopped} transcoding groups, should only be 1`);
        }
      }
    }
  }

  static stopVideotranscoders(group: string) {
    if (!global.transcoders || !global.transcoders.length) return;
    let i = global.transcoders.length;
    let anythingStopped = false;
    while (i--) {
      if (global.transcoders[i].group === group) {
        global.transcoders[i].stop();
        global.transcoders.splice(i, 1);
        anythingStopped = true;
      }
    }
    return anythingStopped;
  }

  static stopGlobalTranscodings() {
    if (!global.transcoders || !global.transcoders.length) return;
    let i = global?.transcoders?.length;

    if (i === undefined) return;

    let stopped = 0;
    while (i--) {
      global.transcoders[i].stop();
      global.transcoders.splice(i, 1);
      stopped++;
      if (stopped > 1) {
        ffmpegLogger.warn(`[HLS] Stopped ${stopped} transcoding groups, should only be 1`);
      }
    }
  }

  async startTranscoding(
    filePath: string,
    startSegment: number,
    audioStreamIndex: number,
    groupHash: string,
  ) {
    processLogger.info('Starting trasncoding at segemnt ' + startSegment);
    const output = Transcoder.createTempDir(groupHash);

    const fastTranscoding = new Transcoder(filePath, startSegment, groupHash, true); // Fast transcoding
    const transcodingGroup = new TranscoderGroup(groupHash, fastTranscoding);

    // const slowTranscodingStartSegment = startSegment + FAST_START_TIME / SEGMENT_TARGET_DURATION;
    // const slowTranscoding = new Transcoder(filePath, slowTranscodingStartSegment, groupHash, false); // Slow transcoding
    // transcodingGroup.addSlowTranscoding(slowTranscoding);

    if (!global.transcoders) {
      global.transcoders = [];
    }
    global.transcoders.push(transcodingGroup);
    const promises = await transcodingGroup.start(output, audioStreamIndex);

    await Promise.all(promises);

    return true;
  }
}
