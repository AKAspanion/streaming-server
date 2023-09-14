import React, { useMemo, useRef, useState } from 'react';
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
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import NoData from '@/components/NoData';
import { cs } from '@/utils/helpers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import SectionGrid from '@/components/SectionGrid';
import { WEB_VIDEO_FILES } from '@common/constants/app';

function VideoUpload() {
  const [isGridView, setIsGridView] = useState(true);
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

  const ParsedVideos = () => (
    <React.Fragment>
      {parsedVideos.map((v) => {
        return (
          <VideoListItem
            key={v.id}
            video={v}
            loading={false}
            isGrid={isGridView}
            onDelete={handleDelete}
            onSubtitle={handleSubtitle}
          />
        );
      })}
    </React.Fragment>
  );

  const loading = isLoading || subLoading || deleteLoading;

  return (
    <React.Fragment>
      {addLoading && videoLoadProgress ? (
        <div className="absolute h-full w-full">
          <Progress full value={videoLoadProgress} />
        </div>
      ) : loading ? (
        <Spinner full />
      ) : (
        <>
          <div className="p-4">
            <div
              className={cs(
                'flex gap-4 justify-between items-center',
                'h-[var(--video-header-height)] md:h-[var(--video-header-height-md)]',
              )}
            >
              <input
                ref={ref}
                className="invisible fixed pointer-events-none left-0"
                type="file"
                id="file"
                accept={WEB_VIDEO_FILES.join(',')}
                onChange={handleSubmit}
              />
              <div>
                <div className="text-xl font-semibold">Video Stream</div>
                <div className="flex gap-2">
                  <div className="text-sm opacity-60">Upload a Web supported file to stream</div>
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger>
                        <div className="w-5">
                          <InformationCircleIcon />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-center p-3">
                        <p>When a video is added here,</p>
                        <p>It is uploaded and streamed from server</p>
                        <p className="text-xs opacity-60">
                          (only works for {WEB_VIDEO_FILES.join('/')} files)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="gap-2 flex items-center">
                  <Label htmlFor="grid-mode" className="cursor-pointer">
                    Grid View
                  </Label>
                  <Switch
                    id="grid-mode"
                    checked={isGridView}
                    onCheckedChange={() => setIsGridView(!isGridView)}
                  />
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
            </div>
          </div>
          <div
            style={
              {
                '--managevideofolder-content-h': 'calc(100% - var(--video-header-height) - 32px)',
                '--managevideofolder-content-h-md':
                  'calc(100% - var(--video-header-height-md) - 32px)',
              } as React.CSSProperties
            }
            className="h-[var(--managevideofolder-content-h)] md:h-[var(--managevideofolder-content-h-md)] overflow-y-auto"
          >
            {parsedVideos.length === 0 ? (
              <NoData
                className="py-8 px-4"
                title="No video found"
                description="Go ahead and upload some video!"
              />
            ) : (
              <div className="p-4 pt-0">
                {isGridView ? (
                  <SectionGrid>
                    <ParsedVideos />
                  </SectionGrid>
                ) : (
                  <ParsedVideos />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </React.Fragment>
  );
}

export default VideoUpload;
