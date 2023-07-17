// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../config/api";
import axios from "axios";
import { setVideoUploadProgress } from "../store/globalSlice";

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
    getVideos: builder.query<{ data: VideoType[] }, string>({
      query: () => `video`,
      providesTags: ["Video"],
    }),
    addVideo: builder.mutation<VideoType, FormData>({
      queryFn: async (body, api) => {
        try {
          const result = await axios.post(`${baseUrl}/video`, body, {
            onUploadProgress: (upload) => {
              if (upload.total) {
                const uploadloadProgress = Math.round(
                  (100 * upload.loaded) / upload.total
                );
                api.dispatch(setVideoUploadProgress(uploadloadProgress));
              }
            },
          });
          return { data: result.data };
        } catch (axiosError: any) {
          let err = axiosError;
          return {
            error: {
              status: err.response?.status,
              data: err.response?.data || err.message,
            },
          };
        }
      },
      // query: (body) => ({
      //   url: `video`,
      //   method: "POST",
      //   body: body,
      // }),
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
