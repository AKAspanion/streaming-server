import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

import { fileSystemApi } from '@services/file-system';
import { videoApi } from '@services/video';
import { mediaApi } from '@services/media';
import globalReducer from './globalSlice';

const persistConfig = { key: 'streamin-server', storage };

export const store = configureStore({
  reducer: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalData: persistReducer(persistConfig, globalReducer),
    [mediaApi.reducerPath]: mediaApi.reducer,
    [videoApi.reducerPath]: videoApi.reducer,
    [fileSystemApi.reducerPath]: fileSystemApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(mediaApi.middleware)
      .concat(videoApi.middleware)
      .concat(fileSystemApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
