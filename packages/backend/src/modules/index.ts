import { Router } from 'express';
import mediaRouter from './media/mediaRouter';
import videoRouter from './video/videoRouter';
import fileSystemRouter from './file-system/fileSystemRouter';

type RouteMap = Record<string, Router>;

export const routes: RouteMap = {
  '/media': mediaRouter,
  '/video': videoRouter,
  '/file-system': fileSystemRouter,
};
