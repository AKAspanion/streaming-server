import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '@config/api';

export const fileSystemApi = createApi({
  reducerPath: 'fileSystemApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['FileSystem'],
  endpoints: (builder) => ({
    getFileSystem: builder.query<{ data: FileLocationType[] }, { dir: string }>({
      query: (body) => ({
        url: `file-system`,
        method: 'POST',
        body: body,
      }),
      providesTags: ['FileSystem'],
    }),
  }),
});

export const { useGetFileSystemQuery } = fileSystemApi;
