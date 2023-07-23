import { IS_DEV } from '@config/app';
import express from 'express';
import path from 'path';

export const staticFiles = IS_DEV
  ? express.static(path.join(__dirname, '../../../frontend/public'))
  : express.static(path.join(__dirname, '../../frontend/dist'));
