import React, { useMemo } from "react";
import {
  useAddVideoMutation,
  useDeleteVideoMutation,
  useGetVideosQuery,
} from "../../services/video";
import { Link } from "react-router-dom";
import { buttonVariant } from "../../componets/button";

function VideoUpload() {
  const { data, isLoading } = useGetVideosQuery("");
  const [addVideo, { isLoading: addLoading }] = useAddVideoMutation();
  const [deleteVideo, { isLoading: deleteLoading }] = useDeleteVideoMutation();

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

  const handleDelete = (id: string) => {
    deleteVideo(id);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e?.target as HTMLFormElement;
    const targetFile = target.file as HTMLInputElement;

    if (targetFile && targetFile.files) {
      const formdata = new FormData();
      const file = targetFile.files[0];

      if (!file) {
        alert("File is required");
        return;
      }

      formdata.append("video_file", file);

      addVideo(formdata);

      target.reset();
    }
  };

  const loading = isLoading || addLoading || deleteLoading;

  return (
    <div className="p-4">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h1 className="pb-4 text-lg">Upload Video</h1>
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="flex gap-4 justify-between items-center pb-4 ">
              <div className="h-8 flex gap-2 justify-start content-center">
                <input
                  className="h-8"
                  type="file"
                  id="file"
                  accept="video/mp4"
                />
              </div>

              <div>
                <input type="submit" value="Upload File" {...buttonVariant()} />
              </div>
            </div>
          </form>
          <div>
            {parsedVideos.length === 0 && (
              <div className="flex flex-col items-center p-10">
                <div className="text-3xl pb-1 text-yellow-400">⚠️</div>
                <div>No Data Available</div>
              </div>
            )}
            {parsedVideos.map((v) => {
              return (
                <div
                  key={v.id}
                  className="bg-slate-800 p-2 px-4 rounded-md flex items-center gap-4 justify-between mb-4"
                >
                  <div>{v.originalname}</div>
                  <div className="text-2xl flex">
                    <div
                      {...buttonVariant()}
                      onClick={() => handleDelete(v.id)}
                    >
                      🗑️
                    </div>
                    <Link {...buttonVariant()} to={`/video-play/${v.id}`}>
                      ▶️
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default VideoUpload;
