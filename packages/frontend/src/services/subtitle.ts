// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../config/api";
import toWebVTT from "srt-webvtt";

// Define a service using a base URL and expected endpoints
export const subtitleApi = createApi({
  reducerPath: "subtitleApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["Subtitle"],
  endpoints: (builder) => ({
    getSubtitleById: builder.query<string, string>({
      query: (id) => ({
        url: `video/${id}/subtitle`,
        method: "GET",
        responseHandler: async (response) => {
          const textTrackUrl = await toWebVTT(await response.blob());
          return textTrackUrl;
        },
        cache: "no-cache",
      }),
      providesTags: ["Subtitle"],
    }),
    addSubtitle: builder.mutation<File, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `video/${id}/subtitle`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Subtitle"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetSubtitleByIdQuery, useAddSubtitleMutation } = subtitleApi;
