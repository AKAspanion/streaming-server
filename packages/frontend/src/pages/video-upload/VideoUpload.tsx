import React, { useMemo } from 'react';
import { useAddVideoMutation, useDeleteVideoMutation, useGetVideosQuery } from '@services/video';
import { buttonVariant } from '@components/button';
import VideoListItem from './VideoListItem';
import { useAddSubtitleMutation } from '@services/subtitle';
import { toast } from 'react-hot-toast/headless';
import useToastStatus from '@hooks/useToastStatus';
import Spinner from '@components/spinner/Spinner';
import { useAppDispatch, useAppSelector } from '@store/hook';
import Progress from '@components/progress/Progress';
import { setVideoUploadProgress } from '@store/globalSlice';

function VideoUpload() {
  const videoLoadProgress = useAppSelector((s) => s?.globalData?.videoUploadProgress);

  const dispatch = useAppDispatch();

  const { data, isLoading } = useGetVideosQuery('');
  const [addVideo, { status: addStatus, isLoading: addLoading }] = useAddVideoMutation();
  const [addSubtitle, { isLoading: subLoading, status: subStatus }] = useAddSubtitleMutation();
  const [deleteVideo, { isLoading: deleteLoading, status: deleteStatus }] =
    useDeleteVideoMutation();

  const parsedVideos = useMemo(() => (data?.data ? data?.data : []), [data]);

  const handleDelete = async (v: VideoType) => {
    await deleteVideo(v.id);
  };

  const handleSubtitle = async (v: VideoType, file?: File) => {
    if (file) {
      const body = new FormData();
      body.append('sub_file', file);

      await addSubtitle({ id: v.id, body });
    } else {
      toast.error('File is required');
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setVideoUploadProgress(0));

    const target = e?.target as HTMLFormElement;
    const targetFile = target.file as HTMLInputElement;

    if (targetFile && targetFile.files) {
      const formdata = new FormData();
      const file = targetFile.files[0];

      if (!file) {
        toast.error('File is required');
        return;
      }

      formdata.append('video_file', file);

      await addVideo(formdata);

      target.reset();
    }
  };

  useToastStatus(addStatus, {
    successMessage: 'Successfully added Video!',
    errorMessage: 'Failed to add Video',
  });

  useToastStatus(subStatus, {
    successMessage: 'Successfully added Subtitle!',
    errorMessage: 'Failed to add Subtitle',
  });

  useToastStatus(deleteStatus, {
    successMessage: 'Successfully deleted Video!',
    errorMessage: 'Failed to delete Video',
  });

  const loading = isLoading || subLoading || deleteLoading;

  return (
    <>
      {addLoading && videoLoadProgress ? (
        <div className="fixed w-screen">
          <Progress value={videoLoadProgress} />
        </div>
      ) : loading ? (
        <div className="fixed">
          <Spinner full />
        </div>
      ) : (
        <>
          <h1 className="p-4 text-lg font-bold bg-slate-900">Upload Video</h1>
          <form className="m-4" onSubmit={(e) => handleSubmit(e)}>
            <div className="flex gap-4 justify-between items-center ">
              <div className="h-6 flex gap-2 justify-start content-center">
                <input className="h-8" type="file" id="file" accept="video/mp4" />
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
