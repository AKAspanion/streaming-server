import React, { useMemo } from "react";
import {
  useAddVideoMutation,
  useDeleteVideoMutation,
  useGetVideosQuery,
} from "../../services/video";
import { buttonVariant } from "../../componets/button";
import VideoListItem from "./VideoListItem";
import { useAddSubtitleMutation } from "../../services/subtitle";
import { toast } from "react-hot-toast/headless";
import useToastStatus from "../../hooks/useToastStatus";
import Spinner from "../../componets/spinner/Spinner";

function VideoUpload() {
  const { data, isLoading } = useGetVideosQuery("");
  const [addVideo, { status: addStatus, isLoading: addLoading }] =
    useAddVideoMutation();
  const [addSubtitle, { isLoading: subLoading, status: subStatus }] =
    useAddSubtitleMutation();
  const [deleteVideo, { isLoading: deleteLoading, status: deleteStatus }] =
    useDeleteVideoMutation();

  const parsedVideos = useMemo(
    () =>
      data?.data
        ? Object.keys(data?.data || {}).map((id) => ({
            ...(data.data[id] || {}),
            id,
          }))
        : [],
    [data]
  );

  const handleDelete = (v: VideoType) => {
    deleteVideo(v.id);
  };

  const handleSubtitle = (v: VideoType, file?: File) => {
    if (file) {
      const body = new FormData();
      body.append("sub_file", file);

      addSubtitle({ id: v.id, body });
    } else {
      toast.error("File is required");
      return;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e?.target as HTMLFormElement;
    const targetFile = target.file as HTMLInputElement;

    if (targetFile && targetFile.files) {
      const formdata = new FormData();
      const file = targetFile.files[0];

      if (!file) {
        toast.error("File is required");
        return;
      }

      formdata.append("video_file", file);

      addVideo(formdata);

      target.reset();
    }
  };

  useToastStatus(addStatus, {
    successMessage: "Successfully added Video!",
    errorMessage: "Failed to add Video",
  });

  useToastStatus(subStatus, {
    successMessage: "Successfully added Subtitle!",
    errorMessage: "Failed to add Subtitle",
  });

  useToastStatus(deleteStatus, {
    successMessage: "Successfully deleted Video!",
    errorMessage: "Failed to delete Video",
  });

  const loading = isLoading || addLoading || subLoading || deleteLoading;

  return (
    <>
      {loading ? (
        <Spinner full />
      ) : (
        <>
          <h1 className="p-4 text-lg font-bold bg-slate-900">Upload Video</h1>
          <form className="m-4" onSubmit={(e) => handleSubmit(e)}>
            <div className="flex gap-4 justify-between items-center ">
              <div className="h-6 flex gap-2 justify-start content-center">
                <input
                  className="h-8"
                  type="file"
                  id="file"
                  accept="video/mp4"
                />
              </div>

              <div>
                <input type="submit" value="Upload" {...buttonVariant()} />
              </div>
            </div>
          </form>
          <div className="m-4">
            {parsedVideos.length === 0 && (
              <div className="flex flex-col items-center p-10">
                <div className="text-3xl pb-1 text-yellow-400">⚠️</div>
                <div>No Data Available</div>
              </div>
            )}
            {parsedVideos.map((v) => {
              return (
                <VideoListItem
                  key={v.id}
                  video={v}
                  loading={false}
                  onDelete={handleDelete}
                  onSubtitle={handleSubtitle}
                />
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

export default VideoUpload;
