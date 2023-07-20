import axios from 'axios';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '@config/api';
import { setVideoUploadProgress } from '@store/globalSlice';

export const videoApi = createApi({
  reducerPath: 'videoApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Video'],
  endpoints: (builder) => ({
    getVideoById: builder.query<{ data: VideoType }, string>({
      query: (id) => `video/${id}`,
      providesTags: ['Video'],
    }),
    getVideos: builder.query<{ data: VideoType[] }, string>({
      query: () => `video`,
      providesTags: ['Video'],
    }),
    addVideo: builder.mutation<VideoType, FormData>({
      queryFn: async (body, api) => {
        try {
          const result = await axios.post(`${baseUrl}/video`, body, {
            onUploadProgress: (upload) => {
              if (upload.total) {
                const uploadloadProgress = Math.round((100 * upload.loaded) / upload.total);
                api.dispatch(setVideoUploadProgress(uploadloadProgress));
              }
            },
          });
          return { data: result.data };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (axiosError: any) {
          const err = axiosError;
          return {
            error: {
              status: err?.response?.status,
              data: err?.response?.data || err.message,
            },
          };
        }
      },
      invalidatesTags: ['Video'],
    }),
    deleteVideo: builder.mutation<VideoType, string>({
      query: (id) => ({
        url: `video/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Video'],
    }),
  }),
});

export const {
  useGetVideoByIdQuery,
  useGetVideosQuery,
  useAddVideoMutation,
  useDeleteVideoMutation,
} = videoApi;
