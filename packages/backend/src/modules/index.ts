import { Router } from 'express';
import mediaRouter from './media/mediaRouter';
import videoRouter from './video/videoRouter';
import folderRouter from './folder/folderRouter';
import subtitleRouter from './subtitle/subtitleRouter';
import fileSystemRouter from './file-system/fileSystemRouter';

type RouteMap = Record<string, Router>;

export const routes: RouteMap = {
  '/media': mediaRouter,
  '/video': videoRouter,
  '/folder': folderRouter,
  '/subtitle': subtitleRouter,
  '/file-system': fileSystemRouter,
};
