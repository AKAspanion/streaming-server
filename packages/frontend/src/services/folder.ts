import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '@config/api';

export const folderApi = createApi({
  reducerPath: 'folderApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['FolderList', 'FolderDetails', 'MediaInFolder'],
  endpoints: (builder) => ({
    getFolder: builder.query<{ data: FolderType[] }, string>({
      query: () => `folder`,
      providesTags: ['FolderList'],
    }),
    getFolderById: builder.query<{ data: FolderType }, string>({
      query: (id) => `folder/${id}`,
      providesTags: ['FolderDetails'],
    }),
    getMediaInFolder: builder.query<{ data: MediaType[] }, string>({
      query: (id) => `folder/${id}/media`,
      providesTags: ['MediaInFolder'],
    }),
    addFolder: builder.mutation<{ data: FolderType }, AddFolderRequest>({
      query: (body) => ({
        url: `folder`,
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['FolderList'],
    }),
    updateFolder: builder.mutation<{ data: FolderType }, UpdateFolderRequest>({
      query: (body) => ({
        url: `folder/${body?.id}`,
        method: 'PUT',
        body: body,
      }),
      invalidatesTags: ['FolderList', 'FolderDetails'],
    }),
    deleteFolder: builder.mutation<{ data: FolderType }, string>({
      query: (id) => ({
        url: `folder/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FolderList'],
    }),
  }),
});

export const {
  useGetFolderQuery,
  useAddFolderMutation,
  useGetFolderByIdQuery,
  useGetMediaInFolderQuery,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
} = folderApi;
