import IconButton from '@components/atoms/icon-button/IconButton';
import { baseUrl } from '@config/api';
import { LinkIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/solid';
import { copyTextToClipboard } from '@utils/dom';
import { toast } from 'react-hot-toast/headless';
import { FC } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface MediaCardProps {
  media: MediaType;
}

const MediaCard: FC<MediaCardProps> = ({ media }) => {
  const copyLink = async (txt: string) => {
    const res = await copyTextToClipboard(baseUrl + '/#' + txt);
    console.log(res);
    if (res) toast.success('Network link copied');
    else toast.error('Failed to copy link');
  };

  return (
    <div className="p-1 h-full ">
      <div
        key={media.id}
        className="transition-all h-full flex flex-col rounded-lg overflow-hidden shadow-md bg-slate-200 dark:bg-slate-800 hover:shadow-lg"
      >
        <div className="h-40 rounded-lg overflow-hidden">
          <img
            src={`${baseUrl}/media/${media.id}/thumbnail`}
            className="w-full h-full object-cover"
          />
        </div>
        <div
          title={media.originalName}
          className="p-3 pb-0 text-ellipsis whitespace-nowrap overflow-hidden font-semibold"
        >
          {media.originalName}
        </div>
        {media?.format?.filename && (
          <div title={media.originalName} className="text-xs p-3 pt-1 pb-0 break-all">
            {media?.format?.filename}
          </div>
        )}
        <div className="flex-1"></div>
        <div className="p-3 flex justify-end w-full gap-3">
          <IconButton>
            <InformationCircleIcon />
          </IconButton>
          <IconButton onClick={() => copyLink(`/video-play/${media.id}`)}>
            <div className="w-3.5 mt-0.5 ml-0.5">
              <LinkIcon />
            </div>
          </IconButton>
          <IconButton>
            <PlayIcon />
          </IconButton>
          <IconButton>
            <TrashIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
