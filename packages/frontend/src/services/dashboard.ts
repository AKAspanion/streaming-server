import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '@/utils/query';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: dynamicBaseQuery,
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
