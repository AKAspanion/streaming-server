/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  SEGMENT_FILE_NO_SEPERATOR,
  SEGMENT_TARGET_DURATION,
  SEGMENT_TEMP_FOLDER,
} from '@constants/hls';
import { timestampToSeconds } from '@utils/date-time';
import { getffmpeg } from '@utils/ffmpeg';
import { getResourcePath, makeDirectory } from '@utils/helper';
import { getTotalSegments } from '@utils/hls';
import { ffmpegLogger, processLogger } from '@utils/logger';
import { FfmpegCommand } from 'fluent-ffmpeg';
import { waitForFileAccess } from '@utils/file';
import path from 'path';

export default class Transcoder {
  group: string;
  filePath: string;
  duration: number;
  lastRequestedTime: number;
  startSegment: number;
  latestSegment: number;
  watchProgress: number;
  audioStreamIndex: number;
  finished: boolean;
  ffmpegProc: FfmpegCommand;

  output: string;

  constructor(group: string, filePath: string, startSegment: number, duration: number) {
    this.group = group;
    this.lastRequestedTime = Date.now();
    this.filePath = filePath;
    this.startSegment = startSegment;
    this.latestSegment = startSegment;
    this.watchProgress = 0; // In procentage, 0-100
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

  stop() {
    processLogger.info('[HLS] Stopping transcoder');
    try {
      // @ts-ignore
      this.ffmpegProc.kill();
    } catch (error) {
      // err
    }
    // this.removeTempFolder();
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

  async start(output: string, audioStreamIndex: number) {
    this.output = output;
    this.audioStreamIndex = audioStreamIndex;

    const promises = [];
    promises.push(this.startProcessing());
    return promises;
  }

  startProcessing() {
    return new Promise((resolve) => {
      const outputOptions = this.getOutputOptions();

      outputOptions.push('-map -a');
      outputOptions.push(`-map 0:${this.audioStreamIndex}`);

      const inputOptions = this.getInputOptions();

      const ffmpeg = getffmpeg();
      try {
        this.ffmpegProc = ffmpeg(this.filePath, { timeout: 432000 })
          .inputOptions(inputOptions)
          .outputOptions(outputOptions)
          .on('end', () => {
            this.finished = true;
          })
          .on('progress', (progress) => {
            const seconds = timestampToSeconds(progress.timemark);
            if (seconds > 0) {
              const latestSegment = Math.max(Math.floor(seconds / SEGMENT_TARGET_DURATION) - 1); // - 1 because the first segment is 0
              this.latestSegment = latestSegment;
            }
          })
          .on('start', async (commandLine) => {
            processLogger.info(
              `[HLS] Spawned Ffmpeg (startSegment: ${this.startSegment} with command: ${commandLine})`,
            );
            ffmpegLogger.info(commandLine);
            const totalSegment = getTotalSegments(this.duration);
            const lookaheadSegment =
              this.startSegment + 5 > totalSegment ? totalSegment : this.startSegment + 5;
            const filePath = path.join(
              this.output,
              `${this.group}${SEGMENT_FILE_NO_SEPERATOR}${lookaheadSegment}.ts`,
            );
            processLogger.info(`[HLS]Waiting for Segment ${lookaheadSegment}`);
            waitForFileAccess(
              { filePath },
              () => {
                resolve(true);
                processLogger.info(`[HLS]Found Segment ${lookaheadSegment}`);
              },
              () => resolve(false),
            );

            resolve(true);
          })
          .on('error', (err, stdout, stderr) => {
            if (
              err.message != 'Output stream closed' &&
              err.message != 'ffmpeg was killed with signal SIGKILL'
            ) {
              ffmpegLogger.error(`Cannot process video: ${err.message}`);
            }
            ffmpegLogger.error(stderr);
            console.error(err);
          })
          .output(this.output);
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
      this.getSeekParameter(),
      '-hwaccel auto',
    ];

    return options;
  }

  getSeekParameter() {
    return `-ss ${this.startSegment * SEGMENT_TARGET_DURATION}`;
  }

  getOutputOptions() {
    const options = [
      '-copyts',
      '-filter_complex [0:0]format@f1=pix_fmts=yuv420p[f1_out0]',
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
      '-crf:v:0 23',
      '-x264opts:v:0 subme=0:me_range=4:rc_lookahead=10:partitions=none',
      // '-max_delay 5000000',
      '-avoid_negative_ts disabled',
      '-c:a:0 libmp3lame',
      '-ab:a:0 192000',
      '-ac:a:0 2',
      '-map_metadata -1',
      '-map_chapters -1',
      '-segment_format mpegts',
      '-f hls',
      `-hls_time ${SEGMENT_TARGET_DURATION}`,
      '-force_key_frames expr:gte(t,n_forced*2)',
      '-hls_playlist_type vod',
      '-hls_list_size 100',
      // '-hls_flags +temp_file+split_by_time',
      `-start_number ${this.startSegment}`,
      `-segment_list ${this.output}/${this.group}${SEGMENT_FILE_NO_SEPERATOR}_temp.m3u8`,
      `-hls_segment_filename ${this.output}/${this.group}${SEGMENT_FILE_NO_SEPERATOR}%01d.ts`,
      // '-strict 1',
      // '-ac 2',
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
}

module.exports = Transcoder;
