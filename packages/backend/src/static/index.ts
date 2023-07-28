import { IS_DEV } from '@config/app';
import { getResourcePath } from '@utils/helper';
import express from 'express';
import path from 'path';

export const webFiles = IS_DEV
  ? express.static(path.join(__dirname, '../../../frontend/public'))
  : express.static(path.join(__dirname, '../../frontend/dist'));

export const hlsFiles = express.static(getResourcePath('_temp'));
