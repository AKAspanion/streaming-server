import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '@config/api';

export const serverApi = createApi({
  reducerPath: 'serverApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
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
