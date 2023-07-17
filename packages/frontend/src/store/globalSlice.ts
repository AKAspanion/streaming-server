import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  videoUploadProgress: 0,
};

export const globalSlice = createSlice({
  name: "globalSlice",
  initialState,
  reducers: {
    setVideoUploadProgress: (state, action) => {
      return {
        ...state,
        videoUploadProgress: action.payload,
      };
    },
  },
});

export const { setVideoUploadProgress } = globalSlice.actions;

export default globalSlice.reducer;
