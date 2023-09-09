import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getNetworkAPIUrl } from '@config/api';

const baseUrl = getNetworkAPIUrl();

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['dashboard'],
  endpoints: (builder) => ({
    getRecentAdded: builder.query<{ data: MediaTypeFull[] }, void>({
      query: () => `dashboard/recent`,
      providesTags: ['dashboard'],
    }),
    getFavourites: builder.query<{ data: MediaTypeFull[] }, void>({
      query: () => `dashboard/favourite`,
      providesTags: ['dashboard'],
    }),
    getRecentWatched: builder.query<{ data: MediaTypeFull[] }, void>({
      query: () => `dashboard/continue`,
      providesTags: ['dashboard'],
    }),
  }),
});

export const { useGetRecentAddedQuery, useGetRecentWatchedQuery, useGetFavouritesQuery } =
  dashboardApi;
