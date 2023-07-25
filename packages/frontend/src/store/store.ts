import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

import { videoApi } from '../services/video';
import { subtitleApi } from '../services/subtitle';
import globalReducer from './globalSlice';

const persistConfig = { key: 'streamin-server', storage };

export const store = configureStore({
  reducer: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalData: persistReducer(persistConfig, globalReducer),
    [videoApi.reducerPath]: videoApi.reducer,
    [subtitleApi.reducerPath]: subtitleApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(videoApi.middleware).concat(subtitleApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
