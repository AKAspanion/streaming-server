import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '@config/api';

export const folderApi = createApi({
  reducerPath: 'folderApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Folder', 'MediaInFolder'],
  endpoints: (builder) => ({
    getFolder: builder.query<{ data: FolderType[] }, string>({
      query: () => `folder`,
      providesTags: ['Folder'],
    }),
    getFolderById: builder.query<{ data: FolderType }, string>({
      query: (id) => `folder/${id}`,
      providesTags: ['Folder'],
    }),
    getMediaInFolder: builder.query<{ data: MediaType[] }, string>({
      query: (id) => `folder/${id}/media`,
      providesTags: ['Folder', 'MediaInFolder'],
    }),
    addFolder: builder.mutation<{ data: FolderType }, AddFolderRequest>({
      query: (body) => ({
        url: `folder`,
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['Folder'],
    }),
  }),
});

export const {
  useGetFolderQuery,
  useAddFolderMutation,
  useGetFolderByIdQuery,
  useGetMediaInFolderQuery,
} = folderApi;
