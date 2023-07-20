import { configureStore } from '@reduxjs/toolkit';
import { videoApi } from '../services/video';
import { setupListeners } from '@reduxjs/toolkit/query';
import { subtitleApi } from '../services/subtitle';
import globalReducer from './globalSlice';

export const store = configureStore({
  reducer: {
    globalData: globalReducer,
    [videoApi.reducerPath]: videoApi.reducer,
    [subtitleApi.reducerPath]: subtitleApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(videoApi.middleware).concat(subtitleApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
