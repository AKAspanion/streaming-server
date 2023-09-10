import { dynamicBaseQuery } from '@/utils/query';
import { createApi } from '@reduxjs/toolkit/query/react';

export const fileSystemApi = createApi({
  reducerPath: 'fileSystemApi',
  baseQuery: dynamicBaseQuery,
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
