import React, { useMemo } from "react";
import { useAddVideoMutation, useGetVideosQuery } from "../../services/video";
import { Link } from "react-router-dom";

function VideoUpload() {
  const { data, isLoading } = useGetVideosQuery("");
  const [addVideo, { isLoading: addLoading }] = useAddVideoMutation();

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

  const submitVideo = (e: React.FormEvent<HTMLFormElement>) => {
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

  const loading = isLoading || addLoading;

  return (
    <div className="p-4">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h1 className="pb-4 text-lg">Upload Video</h1>
          <form onSubmit={(e) => submitVideo(e)}>
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
                <input
                  className="rounded-md bg-slate-600 px-4 py-2"
                  type="submit"
                  value="Upload File"
                />
              </div>
            </div>
          </form>
          <div>
            {parsedVideos.map((v) => {
              return (
                <div className="bg-slate-800 p-4 rounded-md flex items-center gap-4 justify-between mb-4">
                  <div>{v.originalname}</div>
                  <Link className="text-3xl" to={`/video-play/${v.id}`}>
                    ▶️
                  </Link>
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
