// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../config/api";

// Define a service using a base URL and expected endpoints
export const videoApi = createApi({
  reducerPath: "videoApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["Video"],
  endpoints: (builder) => ({
    getVideoById: builder.query<{ data: VideoType }, string>({
      query: (id) => `video/${id}`,
      providesTags: ["Video"],
    }),
    getVideos: builder.query<{ data: Record<string, VideoType> }, string>({
      query: () => `video`,
      providesTags: ["Video"],
    }),
    addVideo: builder.mutation<VideoType, FormData>({
      query: (body) => ({
        url: `video`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Video"],
    }),
    deleteVideo: builder.mutation<VideoType, string>({
      query: (id) => ({
        url: `video/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Video"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetVideoByIdQuery,
  useGetVideosQuery,
  useAddVideoMutation,
  useDeleteVideoMutation,
} = videoApi;
