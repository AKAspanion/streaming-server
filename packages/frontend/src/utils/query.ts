import { getNetworkAPIUrl } from '@/config/api';
import { TOKEN_HEADER_KEY } from '@common/constants/app';
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

export const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, WebApi, extraOptions) => {
  const baseUrl = getNetworkAPIUrl();
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      // prepareHeaders: (headers, { getState }) => {
      // const token = (getState() as RootState).auth.token;
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lIjoiTW9uIFNlcCAxOCAyMDIzIDE1OjM5OjMzIEdNVCswNTMwIChJbmRpYSBTdGFuZGFyZCBUaW1lKSIsImlhdCI6MTY5NTAzMTc3M30.11vwBbn-DIKH7IiFH2CuJDRIdURCMCzSUBI5B4Usjpg';

      // If we have a token set in state, let's assume that we should be passing it.
      if (token) {
        headers.set(TOKEN_HEADER_KEY, token);
      }

      return headers;
    },
  });
  return rawBaseQuery(args, WebApi, extraOptions);
};
