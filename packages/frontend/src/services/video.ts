// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../config/api";

// Define a service using a base URL and expected endpoints
export const videoApi = createApi({
  reducerPath: "videoApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["Video"],
  endpoints: (builder) => ({
    getVideoById: builder.query<VideoType, string>({
      query: (id) => `video/${id}`,
    }),
    getVideos: builder.query<{ data: Record<string, VideoType> }, string>({
      query: () => `video`,
    }),
    addVideo: builder.mutation<VideoType, FormData>({
      query: (body) => ({
        url: `video`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Video"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetVideoByIdQuery, useGetVideosQuery, useAddVideoMutation } =
  videoApi;
