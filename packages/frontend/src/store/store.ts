import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

import { fileSystemApi } from '@services/file-system';
import { serverApi } from '@services/server';
import { videoApi } from '@services/video';
import { mediaApi } from '@services/media';
import globalReducer from './globalSlice';
import authReducer from './authSlice';
import { folderApi } from '@/services/folder';
import { IS_DEV } from '@/config/app';
import { dashboardApi } from '@/services/dashboard';

const persistConfig = { key: 'streaming-server', storage };
const authConfig = { key: 'streaming-server-auth', storage };

const globalData = persistReducer(persistConfig, globalReducer);
const authData = persistReducer(authConfig, authReducer);

export const store = configureStore({
  reducer: {
    globalData,
    authData,
    [mediaApi.reducerPath]: mediaApi.reducer,
    [videoApi.reducerPath]: videoApi.reducer,
    [folderApi.reducerPath]: folderApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [fileSystemApi.reducerPath]: fileSystemApi.reducer,
    [serverApi.reducerPath]: serverApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(mediaApi.middleware)
      .concat(videoApi.middleware)
      .concat(folderApi.middleware)
      .concat(dashboardApi.middleware)
      .concat(fileSystemApi.middleware)
      .concat(serverApi.middleware),
  devTools: IS_DEV,
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
