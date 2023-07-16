import { createSlice } from "@reduxjs/toolkit";

type VideoState = {
  videos?: Record<string, VideoType>;
};

const initialState: VideoState = {};

const counterSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {},
});

export const {} = counterSlice.actions;
export default counterSlice.reducer;
