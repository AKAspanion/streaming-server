/* eslint-disable @typescript-eslint/no-explicit-any */
import winston, { format, transports } from 'winston';
import { getResourcePath, makeDirectory } from './helper';

const getDate = () => new Date().toISOString();

const logDir = getResourcePath(`_logs`);
makeDirectory(logDir);

const beLogPath = `_logs/be.txt`;
const accessLogPath = `_logs/access.txt`;
const ffmpegLogPath = `_logs/ffmpeg.txt`;
const pocessLogPath = `_logs/process.txt`;

export const info = (message?: any, ...optionalParams: any[]): void => {
  if (typeof message === 'string') {
    console.log(`[${getDate()}] [INFO] ${message}`, ...optionalParams);
  } else {
    console.log(`[${getDate()}] [INFO]`, message, ...optionalParams);
  }
};

export const error = (message?: any, ...optionalParams: any[]): void => {
  if (typeof message === 'string') {
    console.error(`[${getDate()}] [ERROR] ${message}`, ...optionalParams);
  } else {
    console.error(`[${getDate()}] [ERROR]`, message, ...optionalParams);
  }
};

export const warn = (message?: any, ...optionalParams: any[]): void => {
  if (typeof message === 'string') {
    console.warn(`[${getDate()}] [WARN] ${message}`, ...optionalParams);
  } else {
    console.warn(`[${getDate()}] [WARN]`, message, ...optionalParams);
  }
};

export const logger = winston.createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: 'ffmpeg' },
  transports: [new transports.Console(), new winston.transports.File({ filename: beLogPath })],
});

export const accessLoggger = winston.createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: 'ffmpeg' },
  transports: [new winston.transports.File({ filename: accessLogPath })],
});

export const ffmpegLogger = winston.createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: 'ffmpeg' },
  transports: [new transports.Console(), new winston.transports.File({ filename: ffmpegLogPath })],
});

export const processLogger = winston.createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: 'process' },
  transports: [new winston.transports.File({ filename: pocessLogPath })],
});

export default logger;
