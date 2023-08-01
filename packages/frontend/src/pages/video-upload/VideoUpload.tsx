import React, { useMemo, useRef } from 'react';
import {
  useAddVideoMutation,
  useAddVideoSubtitleMutation,
  useDeleteVideoMutation,
  useGetVideosQuery,
} from '@services/video';
import VideoListItem from './VideoListItem';
import { toast } from 'react-hot-toast/headless';
import useToastStatus from '@hooks/useToastStatus';
import Spinner from '@components/atoms/spinner/Spinner';
import { useAppDispatch, useAppSelector } from '@store/hook';
import Progress from '@components/atoms/progress/Progress';
import { setVideoUploadProgress } from '@store/globalSlice';
import { Button } from '@/components/ui/button';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

function VideoUpload() {
  const ref = useRef<HTMLInputElement>(null);
  const videoLoadProgress = useAppSelector((s) => s?.globalData?.videoUploadProgress);

  const dispatch = useAppDispatch();

  const { data, isLoading } = useGetVideosQuery('');
  const [addVideo, { status: addStatus, isLoading: addLoading }] = useAddVideoMutation();
  const [addSubtitle, { isLoading: subLoading, status: subStatus }] = useAddVideoSubtitleMutation();
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

  const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setVideoUploadProgress(0));

    const target = e?.target;

    if (target.files && target?.files[0]) {
      const formdata = new FormData();
      const file = target.files[0];

      if (!file) {
        toast.error('File is required');
        return;
      }

      formdata.append('video_file', file);

      await addVideo(formdata);

      target.value = '';
    }
  };

  const openFile = () => {
    const subInputDom = ref.current;
    if (subInputDom) {
      subInputDom.click();
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
    <div>
      {addLoading && videoLoadProgress ? (
        <div className="absolute h-full w-full">
          <Progress full value={videoLoadProgress} />
        </div>
      ) : loading ? (
        <Spinner full />
      ) : (
        <>
          <div className="flex gap-4 justify-between items-center p-4">
            <input
              ref={ref}
              className="invisible fixed pointer-events-none left-0"
              type="file"
              id="file"
              accept="video/mp4"
              onChange={handleSubmit}
            />
            <div>
              <div className="text-2xl font-semibold">Video Stream</div>
              <div className="text-sm">Upload a copy your video file here to stream.</div>
            </div>
            <Button onClick={openFile}>
              <div className="flex gap-2 items-center">
                <div>Upload Video</div>
                <div className="w-4">
                  <ArrowUpTrayIcon />
                </div>
              </div>
            </Button>
          </div>
          <div className="p-4 pt-0">
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
    </div>
  );
}

export default VideoUpload;
