import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '@config/api';
import toWebVTT from 'srt-webvtt';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Media', 'MediaDetails'],
  endpoints: (builder) => ({
    getMediaById: builder.query<{ data: MediaTypeJSONDB }, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Media id is required.');
        }
        return `media/${id}`;
      },
      providesTags: ['MediaDetails'],
    }),
    playMediaById: builder.query<{ data: MediaTypeFull }, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Media id is required.');
        }
        return `media/${id}/play`;
      },
    }),
    getMedia: builder.query<{ data: MediaType[] }, string>({
      query: () => `media`,
      providesTags: ['Media', 'MediaDetails'],
    }),
    markMediaFavourite: builder.mutation<APIStatusResponseType, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Media id is required.');
        }

        return { url: `media/${id}/favourite`, method: 'POST' };
      },
      invalidatesTags: ['MediaDetails'],
    }),
    markMediaWatched: builder.mutation<APIStatusResponseType, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Media id is required.');
        }
        return { url: `media/${id}/watched`, method: 'POST' };
      },
      invalidatesTags: ['MediaDetails'],
    }),
    setMediaAudio: builder.mutation<APIStatusResponseType, { id: string; index: string }>({
      query: (body) => ({
        url: `media/${body.id}/audio`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MediaDetails'],
    }),
    setMediaSubtitle: builder.mutation<APIStatusResponseType, { id: string; index: number }>({
      query: (body) => ({
        url: `media/${body.id}/subtitle`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MediaDetails'],
    }),
    updateMediaStatus: builder.mutation<
      APIStatusResponseType,
      { id: string; paused: boolean; currentTime: number }
    >({
      query: (body) => ({
        url: `media/${body.id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['MediaDetails'],
    }),
    stopMediaById: builder.mutation<APIStatusResponseType, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Media id is required.');
        }
        return { url: `media/${id}/stop`, method: 'PUT' };
      },
      invalidatesTags: ['MediaDetails'],
    }),
    deleteMediaById: builder.mutation<APIStatusResponseType, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Media id is required.');
        }

        return { url: `media/${id}`, method: 'DELETE' };
      },
      invalidatesTags: ['Media'],
    }),
    addMedia: builder.mutation<APIStatusResponseType, AddMediaAPIRequest>({
      query: (body) => ({
        url: `media`,
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['Media'],
    }),
    getMediaSubtitleById: builder.query<string, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Media id is required.');
        }

        return {
          url: `subtitle/${id}/media`,
          method: 'GET',
          responseHandler: async (response) => {
            const textTrackUrl = await toWebVTT(await response.blob());
            return textTrackUrl;
          },
          cache: 'no-cache',
        };
      },
    }),
    addMediaSubtitle: builder.mutation<File, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `subtitle/${id}/media`,
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['MediaDetails'],
    }),
    deleteMediaSubtitle: builder.mutation<APIStatusResponseType, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Media id is required.');
        }
        return { url: `subtitle/${id}/media`, method: 'DELETE' };
      },
      invalidatesTags: ['MediaDetails'],
    }),
  }),
});

export const {
  useAddMediaMutation,
  useGetMediaQuery,
  useGetMediaByIdQuery,
  useDeleteMediaByIdMutation,
  usePlayMediaByIdQuery,
  useMarkMediaFavouriteMutation,
  useMarkMediaWatchedMutation,
  useUpdateMediaStatusMutation,
  useSetMediaAudioMutation,
  useSetMediaSubtitleMutation,
  useStopMediaByIdMutation,
  useGetMediaSubtitleByIdQuery,
  useAddMediaSubtitleMutation,
  useDeleteMediaSubtitleMutation,
} = mediaApi;
