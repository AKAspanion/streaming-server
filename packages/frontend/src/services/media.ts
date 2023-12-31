import { dynamicBaseQuery } from '@/utils/query';
import { createApi } from '@reduxjs/toolkit/query/react';
import toWebVTT from 'srt-webvtt';
import { dashboardApi } from './dashboard';
import { folderApi } from './folder';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['MediaList', 'MediaDetails', 'PlayMedia'],
  endpoints: (builder) => ({
    getMediaById: builder.query<{ data: MediaTypeJsonDB }, string>({
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
      providesTags: ['PlayMedia'],
    }),
    getMedia: builder.query<{ data: MediaType[] }, string>({
      query: () => `media`,
      providesTags: ['MediaList'],
    }),
    markMediaFavorite: builder.mutation<APIStatusResponseType, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Media id is required.');
        }

        return { url: `media/${id}/favorite`, method: 'POST' };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(dashboardApi.util.invalidateTags(['Dashboard']));
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
    setMediaResolution: builder.mutation<APIStatusResponseType, { id: string; resolution: string }>(
      {
        query: (body) => ({
          url: `media/${body.id}/resolution`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['MediaDetails'],
      },
    ),
    updateMediaStatus: builder.mutation<
      APIStatusResponseType,
      { id: string; paused: boolean; currentTime: number; watched?: boolean }
    >({
      query: (body) => ({
        url: `media/${body.id}/status`,
        method: 'PUT',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(dashboardApi.util.invalidateTags(['Dashboard']));
        dispatch(folderApi.util.invalidateTags(['MediaInFolder']));
      },
      invalidatesTags: ['MediaDetails', 'MediaList'],
    }),
    stopMediaById: builder.mutation<APIStatusResponseType, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Media id is required.');
        }
        return { url: `media/${id}/stop`, method: 'PUT' };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(dashboardApi.util.invalidateTags(['Dashboard']));
        dispatch(folderApi.util.invalidateTags(['MediaInFolder']));
      },
      invalidatesTags: ['MediaDetails', 'MediaList'],
    }),
    deleteMediaById: builder.mutation<APIStatusResponseType, string>({
      query: (id) => {
        if (!id) {
          throw new Error('Media id is required.');
        }

        return { url: `media/${id}`, method: 'DELETE' };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(folderApi.util.invalidateTags(['MediaInFolder']));
        dispatch(dashboardApi.util.invalidateTags(['Dashboard']));
      },
      invalidatesTags: ['MediaList'],
    }),
    addMedia: builder.mutation<APIStatusResponseType, AddMediaAPIRequest>({
      query: (body) => ({
        url: `media`,
        method: 'POST',
        body: body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(mediaApi.util.invalidateTags(['MediaList']));
        dispatch(folderApi.util.invalidateTags(['FolderList', 'FolderDetails', 'MediaInFolder']));
      },
      invalidatesTags: ['MediaList'],
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
    deleteMediaSubtitle: builder.mutation<
      APIStatusResponseType,
      { id: string; subtitleId: string }
    >({
      query: ({ id, subtitleId }) => {
        if (!id) {
          throw new Error('Media id is required.');
        }
        return { url: `subtitle/${id}/media`, body: { id, subtitleId }, method: 'DELETE' };
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
  useMarkMediaFavoriteMutation,
  useMarkMediaWatchedMutation,
  useUpdateMediaStatusMutation,
  useSetMediaAudioMutation,
  useSetMediaSubtitleMutation,
  useStopMediaByIdMutation,
  useGetMediaSubtitleByIdQuery,
  useAddMediaSubtitleMutation,
  useDeleteMediaSubtitleMutation,
  useSetMediaResolutionMutation,
} = mediaApi;
