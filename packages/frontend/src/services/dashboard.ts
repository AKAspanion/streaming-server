import { createApi } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from '@/utils/query';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getRecentAdded: builder.query<{ data: MediaTypeFull[] }, void>({
      query: () => `dashboard/recent`,
      providesTags: ['Dashboard'],
    }),
    getFavorites: builder.query<{ data: MediaTypeFull[] }, void>({
      query: () => `dashboard/favorite`,
      providesTags: ['Dashboard'],
    }),
    getRecentWatched: builder.query<{ data: MediaTypeFull[] }, void>({
      query: () => `dashboard/continue`,
      providesTags: ['Dashboard'],
    }),
    getRecentCompleted: builder.query<{ data: MediaTypeFull[] }, void>({
      query: () => `dashboard/completed`,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetRecentCompletedQuery,
  useGetRecentAddedQuery,
  useGetRecentWatchedQuery,
  useGetFavoritesQuery,
} = dashboardApi;
