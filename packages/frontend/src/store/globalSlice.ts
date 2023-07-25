import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  videoUploadProgress: 0,
  sidebarOpen: true,
};

export const globalSlice = createSlice({
  name: 'globalSlice',
  initialState,
  reducers: {
    setVideoUploadProgress: (state, action) => {
      return {
        ...state,
        videoUploadProgress: action.payload,
      };
    },
    setSidebarOpen: (state, action) => {
      return {
        ...state,
        sidebarOpen: action.payload,
      };
    },
  },
});

export const { setSidebarOpen, setVideoUploadProgress } = globalSlice.actions;

export default globalSlice.reducer;
