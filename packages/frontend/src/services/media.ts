import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '@config/api';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Media', 'MediaDetails'],
  endpoints: (builder) => ({
    getMediaById: builder.query<{ data: MediaTypeFull }, string>({
      query: (id) => `media/${id}`,
      providesTags: ['MediaDetails'],
    }),
    getMedia: builder.query<{ data: MediaType[] }, string>({
      query: () => `media`,
      providesTags: ['Media'],
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
} = mediaApi;
