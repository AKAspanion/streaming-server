import axios from 'axios';
import { createApi } from '@reduxjs/toolkit/query/react';
import { getNetworkAPIUrlWithAuth } from '@config/api';
import { setVideoUploadProgress } from '@store/globalSlice';
import toWebVTT from 'srt-webvtt';
import { dynamicBaseQuery } from '@/utils/query';

export const videoApi = createApi({
  reducerPath: 'videoApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Video'],
  endpoints: (builder) => ({
    getVideoById: builder.query<{ data: VideoType }, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Video id is required.');
        }
        return `video/${id}`;
      },
      providesTags: ['Video'],
    }),
    getVideos: builder.query<{ data: VideoType[] }, string>({
      query: () => `video`,
      providesTags: ['Video'],
    }),
    addVideo: builder.mutation<VideoType, FormData>({
      queryFn: async (body, api) => {
        try {
          const result = await axios.post(getNetworkAPIUrlWithAuth(`/video`), body, {
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
      query: (id) => {
        if (!id) {
          throw new Error('Video id is required.');
        }
        return { url: `video/${id}`, method: 'DELETE' };
      },
      invalidatesTags: ['Video'],
    }),
    getVideoSubtitleById: builder.query<string, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Video id is required.');
        }
        return {
          url: `subtitle/${id}/video`,
          method: 'GET',
          responseHandler: async (response) => {
            const textTrackUrl = await toWebVTT(await response.blob());
            return textTrackUrl;
          },
          cache: 'no-cache',
        };
      },
    }),
    addVideoSubtitle: builder.mutation<File, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `subtitle/${id}/video`,
        method: 'POST',
        body: body,
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
  useAddVideoSubtitleMutation,
  useGetVideoSubtitleByIdQuery,
} = videoApi;
