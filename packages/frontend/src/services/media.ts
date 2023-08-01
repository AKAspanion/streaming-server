import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '@config/api';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Media', 'MediaDetails'],
  endpoints: (builder) => ({
    getMediaById: builder.query<{ data: MediaTypeJSONDB }, string>({
      query: (id) => `media/${id}`,
      providesTags: ['MediaDetails'],
    }),
    playMediaById: builder.query<{ data: MediaTypeFull }, string>({
      query: (id) => `media/${id}/play`,
    }),
    getMedia: builder.query<{ data: MediaType[] }, string>({
      query: () => `media`,
      providesTags: ['Media', 'MediaDetails'],
    }),
    markMediaFavourite: builder.mutation<{ data: { message: string } }, string>({
      query: (id) => ({
        url: `media/${id}/favourite`,
        method: 'POST',
      }),
      invalidatesTags: ['MediaDetails'],
    }),
    markMediaWatched: builder.mutation<{ data: { message: string } }, string>({
      query: (id) => ({
        url: `media/${id}/watched`,
        method: 'POST',
      }),
      invalidatesTags: ['MediaDetails'],
    }),
    setMediaAudio: builder.mutation<{ data: { message: string } }, { id: string; index: string }>({
      query: (body) => ({
        url: `media/${body.id}/audio`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MediaDetails'],
    }),
    updateMediaStatus: builder.mutation<
      { data: { message: string } },
      { id: string; paused: boolean; currentTime: number }
    >({
      query: (body) => ({
        url: `media/${body.id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['MediaDetails'],
    }),
    stopMediaById: builder.mutation<{ data: { message: string } }, string>({
      query: (id) => ({
        url: `media/${id}/stop`,
        method: 'PUT',
      }),
      invalidatesTags: ['MediaDetails'],
    }),
    deleteMediaById: builder.mutation<{ data: { message: string } }, string>({
      query: (id) => ({
        url: `media/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Media'],
    }),
    addMedia: builder.mutation<{ data: { data: string } }, { file: FileLocationType }>({
      query: (body) => ({
        url: `media`,
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['Media'],
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
  useStopMediaByIdMutation,
} = mediaApi;
