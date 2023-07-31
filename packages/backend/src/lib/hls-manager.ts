/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

import { ffmpegLogger, processLogger } from '@utils/logger';
import TranscoderGroup from './transcoder-group';
import { AsyncLock } from 'node-async-locks';
import Transcoder from './transcoder';
import { SEGMENT_TEMP_FOLDER } from '@constants/hls';

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

  isAnyVideoTranscoderActive(group: string) {
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

  getVideoTranscoderOutputPath(group: string) {
    if (!global.transcoders || !global.transcoders.length) return `${SEGMENT_TEMP_FOLDER}/${group}`;
    const transcoder = global.transcoders.find((transcoder) => transcoder.group === group);
    return transcoder ? transcoder.getOutputFolder() : `${SEGMENT_TEMP_FOLDER}/${group}`;
  }

  isTranscoderFinished(group: string) {
    if (!global.transcoders || !global.transcoders.length) return;
    const transcoder = global.transcoders.find((transcoder) => transcoder.group === group);
    if (transcoder == undefined) return false;
    return transcoder.isTranscoderFinished();
  }

  getTranscoderStartSegment(group: string) {
    if (!global.transcoders || !global.transcoders.length) return -1;
    const transcoder = global.transcoders.find((transcoder) => transcoder.group === group);
    if (transcoder == undefined) return -1;
    return transcoder.getStartSegment();
  }

  getVideoTranscoderSegment(group: string) {
    if (!global.transcoders || !global.transcoders.length) return -1;
    const transcoder = global.transcoders.find((transcoder) => transcoder.group === group);
    if (transcoder == undefined) return -1;
    return transcoder.getLatestSegment();
  }

  stopOtherVideoTranscoders(group: string) {
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
      (transcoder) => transcoder.group === group && transcoder.isFastStartRunning(),
    );
  }

  stopAllVideoTranscoders(group: string) {
    if (!global.transcoders || !global.transcoders.length) return;
    let i = global.transcoders.length;
    let stopped = 0;
    while (i--) {
      if (global.transcoders[i].group == group) {
        global.transcoders[i].stop();
        global.transcoders.splice(i, 1);
        stopped++;
        if (stopped > 1) {
          ffmpegLogger.warn(`[HLS] Stopped ${stopped} transcoder groups, should only be 1`);
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

  static stopGlobalTranscoders() {
    if (!global.transcoders || !global.transcoders.length) return;
    let i = global?.transcoders?.length;

    if (i === undefined) return;

    let stopped = 0;
    while (i--) {
      global.transcoders[i].stop();
      global.transcoders.splice(i, 1);
      stopped++;
      if (stopped > 1) {
        ffmpegLogger.warn(`[HLS] Stopped ${stopped} transcoder groups, should only be 1`);
      }
    }
  }

  async startTranscoder(
    filePath: string,
    startSegment: number,
    audioStreamIndex: number,
    groupHash: string,
  ) {
    processLogger.info('Starting trasncoding at segemnt ' + startSegment);
    const output = Transcoder.createTempDir(groupHash);

    const fastTranscoder = new Transcoder(filePath, startSegment, groupHash, true); // Fast transcoder
    const transcoderGroup = new TranscoderGroup(groupHash, fastTranscoder);

    // const slowTranscoderStartSegment = startSegment + FAST_START_TIME / SEGMENT_TARGET_DURATION;
    // const slowTranscoder = new Transcoder(filePath, slowTranscoderStartSegment, groupHash, false); // Slow transcoder
    // transcoderGroup.addSlowTranscoder(slowTranscoder);

    if (!global.transcoders) {
      global.transcoders = [];
    }
    global.transcoders.push(transcoderGroup);
    const promises = await transcoderGroup.start(output, audioStreamIndex);

    await Promise.all(promises);

    return true;
  }
}
