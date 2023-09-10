import { dynamicBaseQuery } from '@/utils/query';
import { createApi } from '@reduxjs/toolkit/query/react';

export const serverApi = createApi({
  reducerPath: 'serverApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['server'],
  endpoints: (builder) => ({
    getNetworkIp: builder.query<{ ip: string }, string>({
      query: () => ({
        url: `server/network-ip`,
        method: 'GET',
      }),
      providesTags: ['server'],
    }),
  }),
});

export const { useGetNetworkIpQuery } = serverApi;
