import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '@config/api';

export const folderApi = createApi({
  reducerPath: 'folderApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Folder'],
  endpoints: (builder) => ({
    getFolder: builder.query<{ data: FolderType[] }, string>({
      query: () => `folder`,
      providesTags: ['Folder'],
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

export const { useGetFolderQuery, useAddFolderMutation } = folderApi;
