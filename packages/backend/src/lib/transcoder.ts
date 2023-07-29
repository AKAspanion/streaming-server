/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  FAST_START_TIME,
  SEGMENT_FILE_NO_SEPERATOR,
  SEGMENT_TARGET_DURATION,
  SEGMENT_TEMP_FOLDER,
} from '@constants/hls';
import { timestampToSeconds } from '@utils/date-time';
import { getffmpeg } from '@utils/ffmpeg';
import { getResourcePath, makeDirectory } from '@utils/helper';
import { ffmpegLogger, processLogger } from '@utils/logger';
import { FfmpegCommand } from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export default class Transcoder {
  filePath: string;
  output: string;
  group: string;
  latestSegment: number;
  startSegment: number;
  finished: boolean;
  fastStart: boolean;
  ffmpegProc: FfmpegCommand;

  constructor(filePath: string, startSegment: number, group: string, fastStart = false) {
    this.filePath = filePath;
    this.startSegment = startSegment;
    this.latestSegment = startSegment;
    this.finished = false;
    this.fastStart = fastStart;
    this.group = group;
    this.output = '';
  }

  static createTempDir(groupHash: string) {
    const dir = getResourcePath(path.join(SEGMENT_TEMP_FOLDER, groupHash));
    makeDirectory(dir);
    processLogger.info('Creating temp folder: ' + dir);
    return dir;
  }

  stop() {
    processLogger.info('[HLS] Stopping transcoding');
    // @ts-ignore
    this.ffmpegProc.kill();
    // If this process is for a transcoding fast start, we need to keep the temp folder for the slow transcoding process
    if (!this.fastStart) {
      this.removeTempFolder();
    }
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
      '-max_delay 5000000',
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
      `-start_number ${this.startSegment}`,
      `-segment_list ${this.output}/${this.group}${SEGMENT_FILE_NO_SEPERATOR}_temp.m3u8`,
      `-hls_segment_filename ${this.output}/${this.group}${SEGMENT_FILE_NO_SEPERATOR}%01d.ts`,
      // '-strict 1',
      // '-ac 2',
      '-b:a 320k',
      '-muxdelay 0',
    ];

    options.concat(this.getCpuOutputOptions());

    return options;
  }

  getCpuOutputOptions() {
    return ['-deadline realtime'];
  }

  getCpuInputOptions(threads: number) {
    return [`-threads ${threads}`];
  }

  getInputOptions(threads: number) {
    const options = ['-y', '-loglevel verbose', '-copyts', this.getSeekParameter()];

    options.concat(this.getCpuInputOptions(threads));

    return options;
  }

  getSeekParameter() {
    return `-ss ${this.startSegment * SEGMENT_TARGET_DURATION}`;
  }

  start(output: string, audioStreamIndex: number) {
    return new Promise((resolve) => {
      this.output = output;

      const outputOptions = this.getOutputOptions();

      outputOptions.push('-map -a');
      outputOptions.push(`-map 0:${audioStreamIndex}`);

      const inputOptions = this.getInputOptions(8);

      // GPU Transcoding only uses fast-start, so we need to transcode the whole file
      if (this.fastStart) {
        outputOptions.push(`-to ${this.startSegment * SEGMENT_TARGET_DURATION + FAST_START_TIME}`); // Quickly transcode the first segments
      } else if (!this.fastStart) {
        // TODO: We shouldn't run slow transcoding on GPU
        inputOptions.push('-re'); // Process the file slowly to save CPU
      }

      const ffmpeg = getffmpeg();

      this.ffmpegProc = ffmpeg(this.filePath)
        .inputOptions(inputOptions)
        .outputOptions(outputOptions)
        .on('end', () => {
          this.finished = true;
        })
        .on('progress', (progress) => {
          // this.addSeekTimeToSeconds(this.timestampToSeconds(progress.timemark)); <- This is needed on other versions of ffmpeg. TODO: How do we know if this is needed?
          const seconds = timestampToSeconds(progress.timemark);
          // Sometimes ffmpeg reports timemark as negative if using nvenc
          if (seconds > 0) {
            const latestSegment = Math.max(Math.floor(seconds / SEGMENT_TARGET_DURATION) - 1); // - 1 because the first segment is 0
            this.latestSegment = latestSegment;
          }
          processLogger.info(
            'Progress: ' + this.group + ' Segment:' + this.latestSegment + ' Time:',
            seconds,
          );
        })
        .on('start', (commandLine) => {
          ffmpegLogger.info(
            `[HLS] Spawned Ffmpeg (startSegment: ${this.startSegment}) with command: ${commandLine}`,
          );
          processLogger.info(commandLine);
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
      this.ffmpegProc.run();
    });
  }

  removeTempFolder() {
    fs.rm(this.output, { recursive: true, force: true }, (err) => {
      if (err) {
        processLogger.error(`Error removing transcoding temp output`);
        processLogger.error(err);
      }
    });
  }
}
