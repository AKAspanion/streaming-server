/* eslint-disable @typescript-eslint/no-explicit-any */
import winston, { format, transports } from 'winston';
import { getResourcePath, makeDirectory } from './helper';

const getDate = () => new Date().toISOString();

const logDir = getResourcePath(`_appdata/_logs`);

makeDirectory(logDir);

// const timestamp = new Date().getTime();
const timestamp = 'test';

const beLogPath = getResourcePath(`_appdata/_logs/be-${timestamp}.log`);
const accessLogPath = getResourcePath(`_appdata/_logs/access-${timestamp}.log`);
const ffmpegLogPath = getResourcePath(`_appdata/_logs/ffmpeg-${timestamp}.log`);
const pocessLogPath = getResourcePath(`_appdata/_logs/process-${timestamp}.log`);
const ffmpegBinLogPath = getResourcePath(`_appdata/_logs/ffmpeg-bin-${timestamp}.log`);

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.printf((info) => {
    const serverLogEntry = (info?.message || '').replace(
      // eslint-disable-next-line no-control-regex
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      '',
    );
    return `[${info.timestamp}][${info.service}][${info.level}]${serverLogEntry}`;
  }),
);

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
  format: logFormat,
  defaultMeta: { service: 'backend' },
  transports: [new transports.Console(), new winston.transports.File({ filename: beLogPath })],
});

export const accessLoggger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'access' },
  transports: [new winston.transports.File({ filename: accessLogPath })],
});

export const ffmpegLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'ffmpeg' },
  transports: [new transports.Console(), new winston.transports.File({ filename: ffmpegLogPath })],
});

export const ffmpegBinLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'ffmpeg-bin' },
  transports: [
    new transports.Console(),
    new winston.transports.File({ filename: ffmpegBinLogPath }),
  ],
});

export const processLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'process' },
  transports: [new transports.Console(), new winston.transports.File({ filename: pocessLogPath })],
});

export default logger;
