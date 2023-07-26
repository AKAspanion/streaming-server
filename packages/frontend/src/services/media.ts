import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '@config/api';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Media'],
  endpoints: (builder) => ({
    getMediaById: builder.query<{ data: MediaTypeFull }, string>({
      query: (id) => `media/${id}`,
      providesTags: ['Media'],
    }),
    getMedia: builder.query<{ data: MediaType[] }, string>({
      query: () => `media`,
      providesTags: ['Media'],
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

export const { useAddMediaMutation, useGetMediaQuery, useGetMediaByIdQuery } = mediaApi;
