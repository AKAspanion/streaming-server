import { getNetworkAPIUrl } from '@/config/api';
import { RootState } from '@/store/store';
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
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).authData?.token;

      if (token) {
        headers.set(TOKEN_HEADER_KEY, token);
      }

      return headers;
    },
  });
  return rawBaseQuery(args, WebApi, extraOptions);
};
