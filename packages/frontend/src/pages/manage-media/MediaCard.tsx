import IconButton from '@components/atoms/icon-button/IconButton';
import { baseUrl } from '@config/api';
import { LinkIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/solid';
import { copyTextToClipboard } from '@utils/dom';
import { toast } from 'react-hot-toast/headless';
import { FC } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import useMediaMutation from '@/hooks/useMediaMutation';
import Spinner from '@components/atoms/spinner/Spinner';
import React from 'react';
import Progress from '@/components/atoms/progress/Progress';
import { formatPercentage } from '@/utils/helpers';

interface MediaCardProps {
  media: MediaType;
}

const MediaCard: FC<MediaCardProps> = ({ media }) => {
  const { handleDelete, isDeleteLoading } = useMediaMutation();

  const copyLink = async (txt: string) => {
    const res = await copyTextToClipboard(baseUrl + '/#' + txt);
    if (res) toast.success('Network link copied');
    else toast.error('Failed to copy link');
  };

  const loading = isDeleteLoading;
  const totalDuration = media?.format?.duration || 0;
  const currentDuration = media?.currentTime || 0;
  const progressValue = totalDuration ? formatPercentage(currentDuration, totalDuration) : 0;

  return (
    <div className="p-1 h-full ">
      <div
        key={media.id}
        className="transition-all h-full flex flex-col rounded-lg overflow-hidden shadow-md bg-slate-200 dark:bg-slate-800 hover:shadow-lg"
      >
        <div className="h-40 rounded-lg overflow-hidden relative">
          <img
            src={`${baseUrl}/media/${media.id}/thumbnail`}
            className="w-full h-full object-cover"
          />
          {currentDuration ? (
            <div className="absolute w-full bottom-0">
              <Progress value={progressValue} />
            </div>
          ) : null}
        </div>
        <div title={media.originalName} className="p-3 pb-0 break-all">
          {media.originalName}
        </div>
        {/* {media?.format?.filename && (
          <div title={media.originalName} className="text-xs p-3 pt-1 pb-0 break-all">
            {media?.format?.filename}
          </div>
        )} */}
        <div className="flex-1"></div>

        <div className="p-3 flex justify-end w-full gap-3">
          {loading ? (
            <Spinner />
          ) : (
            <React.Fragment>
              <Link to={`/manage-media/${media.id}`}>
                <IconButton>
                  <InformationCircleIcon />
                </IconButton>
              </Link>
              <IconButton onClick={() => copyLink(`/media-play/${media.id}`)}>
                <div className="w-3.5 mt-0.5 ml-0.5">
                  <LinkIcon />
                </div>
              </IconButton>
              <Link to={`/media-play/${media.id}`}>
                <IconButton>
                  <PlayIcon />
                </IconButton>
              </Link>
              <IconButton onClick={() => handleDelete(media.id)}>
                <TrashIcon />
              </IconButton>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
