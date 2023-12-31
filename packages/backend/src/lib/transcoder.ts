/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  SEGMENT_FILE_NO_SEPARATOR,
  SEGMENT_TARGET_DURATION,
  SEGMENT_TEMP_FOLDER,
} from '@constants/hls';
import { timestampToSeconds } from '@common/utils/date-time';
import { getffmpeg } from '@utils/ffmpeg';
import { deleteDirectory, fileExists, getResourcePath, makeDirectory } from '@utils/helper';
import { ffmpegBinLogger, ffmpegLogger, processLogger } from '@utils/logger';
import { FfmpegCommand } from 'fluent-ffmpeg';
import path from 'path';
import HLSManager from './hls-manager';

export default class Transcoder {
  group: string;
  filePath: string;
  duration: number;
  lastRequestedTime: number;
  startSegment: number;
  latestSegment: number;
  watchProgress: number;
  audioStreamIndex: number;
  resolution: number;
  finished: boolean;
  ffmpegProc: FfmpegCommand;

  output: string;

  constructor(group: string, filePath: string, startSegment: number, duration: number) {
    this.group = group;
    this.lastRequestedTime = Date.now();
    this.filePath = filePath;
    this.startSegment = startSegment;
    this.latestSegment = startSegment;
    this.watchProgress = 0;
    this.output = '';
    this.finished = false;
    this.duration = duration;
  }

  updateProgress(watchTime: number) {
    this.watchProgress = watchTime;
  }

  getOutputFolder() {
    return this.output;
  }

  getAudioStreamIndex() {
    return this.audioStreamIndex;
  }

  getResolution() {
    return this.resolution;
  }

  stop() {
    processLogger.info('[HLS] Stopping transcoder');
    try {
      // @ts-ignore
      this.ffmpegProc.kill();
    } catch (error) {
      // err
    }
  }

  getLatestSegment() {
    return this.latestSegment;
  }

  getStartSegment() {
    return this.startSegment;
  }

  updateLastRequestedTime() {
    this.lastRequestedTime = Date.now();
  }

  isTranscoderFinished() {
    return this.finished;
  }

  async start(output: string, audioStreamIndex: number, resolution: number) {
    this.output = output;
    this.audioStreamIndex = audioStreamIndex;
    this.resolution = resolution;

    const promises = [];
    promises.push(this.startProcessing());
    return promises;
  }

  startProcessing() {
    return new Promise((resolve) => {
      if (!fileExists(this.filePath)) {
        processLogger.info(`[Transcoder] Can't start, file not found`);
        HLSManager.stopVideoTranscoder(this.group);
        return;
      }

      const outputOptions = this.getOutputOptions();

      outputOptions.push('-map -a');
      outputOptions.push(`-map 0:${this.audioStreamIndex}?`);

      const inputOptions = this.getInputOptions();

      const ffmpeg = getffmpeg();
      try {
        this.ffmpegProc = ffmpeg(this.filePath, { timeout: 432000, logger: ffmpegBinLogger })
          .inputOptions(inputOptions)
          .outputOptions(outputOptions)
          .on('end', () => {
            this.finished = true;
          })
          .on('progress', (progress) => {
            const seconds = timestampToSeconds(progress.timemark);
            if (seconds > 0) {
              const latestTimedSegment = Math.max(
                Math.floor(seconds / SEGMENT_TARGET_DURATION) - 1,
              );
              const computedSegment = latestTimedSegment + this.startSegment || 0;
              this.latestSegment = computedSegment;
            }
          })
          .on('start', async (commandLine) => {
            processLogger.info(
              `[Transcoder] Spawned Ffmpeg (Start Segment: ${this.startSegment})\n${commandLine}`,
            );
            ffmpegLogger.info(commandLine);
            resolve(true);
          })
          .on('error', (err) => {
            if (
              err.message != 'Output stream closed' &&
              err.message != 'ffmpeg was killed with signal SIGKILL'
            ) {
              processLogger.error(`[Transcoder] Cannot process video: ${err.message}`);
              this.removeTempFolder();
            }

            HLSManager.stopVideoTranscoder(this.group);

            ffmpegLogger.error(err.message);
          })
          .output(path.resolve(`${this.output}/${this.group}${SEGMENT_FILE_NO_SEPARATOR}%01d.ts`));
      } catch (error) {
        // err
      }
      this.ffmpegProc.run();
    });
  }

  getInputOptions() {
    const options = [
      '-y',
      '-loglevel verbose',
      '-copyts',
      '-start_at_zero',
      this.getSeekParameter(),
      '-hwaccel auto',
    ];

    return options;
  }

  getSeekParameter() {
    return `-ss ${this.startSegment * SEGMENT_TARGET_DURATION}`;
  }

  getOutputOptions() {
    const videoFilters = [
      `[0:0]scale=-2:${this.resolution}:flags=lanczos[scaled]`,
      '[scaled]format@f1=pix_fmts=yuv420p[f1_out0]',
    ];

    const options = [
      '-copyts',
      `-filter_complex ${videoFilters.join(';')}`,
      '-map [f1_out0]',
      '-sn',
      '-c:v:0 libx264',
      '-g:v:0 72',
      '-maxrate:v:0 6765354',
      '-bufsize:v:0 13530708',
      '-sc_threshold:v:0 0',
      '-keyint_min:v:0 72',
      '-r:v:0 23.976024627685547',
      '-pix_fmt:v:0 yuv420p',
      '-preset:v:0 veryfast',
      '-level:v:0 4.0',
      '-crf:v:0 18',
      '-x264opts:v:0 subme=0:me_range=4:rc_lookahead=10:partitions=none',
      '-max_delay 5000000',
      '-avoid_negative_ts disabled',
      '-c:a:0 libmp3lame',
      '-ab:a:0 192000',
      '-ac:a:0 2',
      '-f segment',
      '-map_metadata -1',
      '-map_chapters -1',
      '-segment_format mpegts',
      `-segment_time ${SEGMENT_TARGET_DURATION}`,
      '-force_key_frames expr:gte(t,n_forced*2)',
      `-segment_start_number ${this.startSegment}`,
      '-individual_header_trailer 0',
      '-write_header_trailer 0',
      '-strict 1',
      '-ac 2',
      '-b:a 320k',
      '-muxdelay 0',
    ];

    return options;
  }

  static createTempDir(groupHash: string) {
    const dir = getResourcePath(path.join(SEGMENT_TEMP_FOLDER, groupHash));
    makeDirectory(dir);
    return dir;
  }

  removeTempFolder() {
    deleteDirectory(this.output);
    makeDirectory(this.output);
  }
}

module.exports = Transcoder;
