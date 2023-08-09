/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */

import { ffmpegLogger } from '@utils/logger';
import Transcoder from './transcoder';
import { SEGMENT_TEMP_FOLDER } from '@constants/hls';
import { getResourcePath } from '@utils/helper';

declare global {
  var transcoders: Transcoder[] | undefined;
}

export default class HLSManager {
  constructor() {
    if (!global.transcoders) {
      global.transcoders = [];
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
    if (!global.transcoders || !global.transcoders.length)
      return getResourcePath(`${SEGMENT_TEMP_FOLDER}/${group}`);
    const transcoder = global.transcoders.find((transcoder) => transcoder.group === group);
    return transcoder
      ? transcoder.getOutputFolder()
      : getResourcePath(`${SEGMENT_TEMP_FOLDER}/${group}`);
  }

  isTranscoderFinished(group: string) {
    if (!global.transcoders || !global.transcoders.length) return;
    const transcoder = global.transcoders.find((transcoder) => transcoder.group === group);
    if (transcoder == undefined) return false;
    return transcoder.isTranscoderFinished();
  }

  isSameAudioStream(group: string, audioIndex: number) {
    if (!global.transcoders || !global.transcoders.length) return;
    const transcoder = global.transcoders.find((transcoder) => transcoder.group === group);
    if (transcoder == undefined) return false;
    return transcoder.getAudioStreamIndex() === audioIndex;
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
    duration: number,
  ) {
    const output = Transcoder.createTempDir(groupHash);

    const transcoder = new Transcoder(groupHash, filePath, startSegment, duration);

    if (!global.transcoders) {
      global.transcoders = [];
    }
    global.transcoders.push(transcoder);
    const promises = await transcoder.start(output, audioStreamIndex);

    await Promise.all(promises);

    return true;
  }
}
