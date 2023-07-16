import { configureStore } from "@reduxjs/toolkit";
import videoSlice from "./video/videoSlice";
import { videoApi } from "../services/video";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    [videoApi.reducerPath]: videoApi.reducer,
    videos: videoSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(videoApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
