/* eslint-disable @typescript-eslint/no-explicit-any */

import { processLogger } from '@utils/logger';
import Transcoder from './transcoder';

export default class TranscoderGroup {
  group: string;
  lastRequestedTime: number;
  watchProgress: number;
  slowTranscoder: Transcoder;
  fastTranscoder: Transcoder;

  output: string;

  constructor(group: string, fastTranscoder: Transcoder) {
    this.group = group;
    this.lastRequestedTime = Date.now();
    this.fastTranscoder = fastTranscoder;
    this.watchProgress = 0; // In procentage, 0-100
    this.output = '';
  }

  addSlowTranscoding(slowTranscoding: Transcoder) {
    this.slowTranscoder = slowTranscoding;
  }

  updateProgress(watchTime: number) {
    this.watchProgress = watchTime;
  }

  addSlowTranscoder(slowTranscoder: Transcoder) {
    this.slowTranscoder = slowTranscoder;
  }

  getOutputFolder() {
    return this.output;
  }

  stop() {
    this.fastTranscoder.stop();
    if (this.slowTranscoder) {
      this.slowTranscoder.stop();
    }
  }

  getLatestSegment() {
    if (
      this.slowTranscoder &&
      this.slowTranscoder.getLatestSegment() > this.fastTranscoder.getLatestSegment()
    ) {
      processLogger.info('Latest Segment is from slow ' + this.slowTranscoder.getLatestSegment());
      return this.slowTranscoder.getLatestSegment();
    }
    processLogger.info('Latest Segment is from fast ' + this.fastTranscoder.getLatestSegment());
    return this.fastTranscoder.getLatestSegment();
  }

  getStartSegment() {
    // The fast Transcoder should always have the first segment number, but just to be sure
    if (
      this.slowTranscoder &&
      this.slowTranscoder.startSegment < this.fastTranscoder.startSegment
    ) {
      return this.slowTranscoder.startSegment;
    }
    return this.fastTranscoder.startSegment;
  }

  updateLastRequestedTime() {
    this.lastRequestedTime = Date.now();
  }

  isTranscoderFinished() {
    if (this.slowTranscoder) {
      return this.slowTranscoder.finished;
    } else {
      return this.fastTranscoder.finished;
    }
  }

  isFastStartRunning() {
    return !this.fastTranscoder.finished;
  }

  async start(output: string, audioStreamIndex: number) {
    this.output = output;
    const promises = [];
    promises.push(this.fastTranscoder.start(output, audioStreamIndex));
    if (this.slowTranscoder) {
      promises.push(this.slowTranscoder.start(output, audioStreamIndex));
    }
    return promises;
  }

  isTranscodingFinished() {
    if (this.slowTranscoder) {
      return this.slowTranscoder.finished;
    } else {
      return this.fastTranscoder.finished;
    }
  }
}

module.exports = TranscoderGroup;
