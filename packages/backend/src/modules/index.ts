import { Router } from 'express';
import authRouter from './auth/authRouter';
import mediaRouter from './media/mediaRouter';
import videoRouter from './video/videoRouter';
import serverRouter from './server/serverRouter';
import folderRouter from './folder/folderRouter';
import subtitleRouter from './subtitle/subtitleRouter';
import dashboardRouter from './dashboard/dashboardRouter';
import fileSystemRouter from './file-system/fileSystemRouter';

type RouteMap = Record<string, Router>;

export const routes: RouteMap = {
  '/auth': authRouter,
  '/server': serverRouter,
  '/media': mediaRouter,
  '/video': videoRouter,
  '/folder': folderRouter,
  '/subtitle': subtitleRouter,
  '/dashboard': dashboardRouter,
  '/file-system': fileSystemRouter,
};
