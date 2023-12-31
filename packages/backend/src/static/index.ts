import { IS_DEV } from '@config/app';
import { SEGMENT_TEMP_FOLDER } from '@constants/hls';
import { getResourcePath } from '@utils/helper';
import express from 'express';
import path from 'path';

export const webFiles = IS_DEV
  ? express.static(path.join(__dirname, '../../../frontend/public'))
  : express.static(
      process.env.FE_PATH_IN_ELECTRON || path.join(__dirname, '../../../../../../frontend/dist'),
    );

export const hlsFiles = express.static(getResourcePath(SEGMENT_TEMP_FOLDER));
