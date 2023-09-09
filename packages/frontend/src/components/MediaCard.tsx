import IconButton from '@components/atoms/icon-button/IconButton';
import { baseUrl } from '@config/api';
import {
  ChatBubbleBottomCenterTextIcon,
  EllipsisVerticalIcon,
  HeartIcon,
  LinkIcon,
  PlayIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { copyTextToClipboard } from '@utils/dom';
import { toast } from 'react-hot-toast/headless';
import { FC } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import useMediaMutation from '@/hooks/useMediaMutation';
import Spinner from '@components/atoms/spinner/Spinner';
import React from 'react';
import Progress from '@/components/atoms/progress/Progress';
import { cs, formatPercentage } from '@/utils/helpers';
import { Card } from '@/components/ui/card';
import CoverButton from '@/components/CoverButton';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { normalizeText } from '@common/utils/validate';
import { IS_DEV, feBaseUrl } from '@/config/app';
import Image from './atoms/image/Image';

interface MediaCardProps {
  folderId?: string;
  backTo?: string;
  media: MediaType;
}

const MediaCard: FC<MediaCardProps> = ({ media, backTo, folderId }) => {
  const { deleteMedia, isDeleteLoading } = useMediaMutation();

  const copyLink = async (txt: string) => {
    let link = feBaseUrl + '/#' + txt;
    if (!IS_DEV) {
      link = baseUrl + '/#' + txt;
    }
    const res = await copyTextToClipboard(link);
    if (res) toast.success('Network link copied');
    else toast.error('Failed to copy link');
  };

  const loading = isDeleteLoading;
  const totalDuration = media?.format?.duration || 0;
  const currentDuration = media?.currentTime || 0;
  const progressValue = totalDuration ? formatPercentage(currentDuration, totalDuration) : 0;

  const hasSub = media?.subs && media?.subs.length;
  const isFavourite = media?.isFavourite;

  return (
    <Card className="h-full relative group">
      <div className="h-full flex flex-col rounded-lg overflow-hidden">
        <CoverButton
          button={
            <Link
              className={cs(
                'text-green-500 group-hover:opacity-100 transition-opacity duration-300',
                'opacity-0  w-full h-full flex items-center justify-center',
              )}
              to={`/media-play/${media.id}?resume=${currentDuration}&folderId=${normalizeText(
                folderId,
              )}&back=${normalizeText(backTo)}`}
            >
              <div className="w-10">
                <PlayIcon />
              </div>
            </Link>
          }
        >
          {isFavourite && (
            <div className="text-white absolute right-3 top-3 shadow-lg">
              <div className="w-5 drop-shadow">
                <HeartIcon className="drop-shadow " />
              </div>
            </div>
          )}
          {hasSub && (
            <div className="text-white absolute left-3 top-3 shadow-lg">
              <div className="w-5 drop-shadow">
                <ChatBubbleBottomCenterTextIcon className="drop-shadow " />
              </div>
            </div>
          )}
          <div className="h-40 rounded-lg overflow-hidden">
            <Image
              src={`${baseUrl}/media/${media.id}/thumbnail`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </CoverButton>
        <div
          className={cs(
            'drop-shadow-xl text-white',
            'group-hover:to-transparent  overflow-hidden',
            'bg-gradient-to-b from-transparent to-slate-900 group-hover:to-transparent',
            'absolute bottom-0 flex gap-4 justify-between items-center rounded-b-lg w-full h-[52px] z-20',
          )}
        >
          <Link
            className="flex-1"
            to={
              folderId
                ? `/manage-media/${folderId}/folder/${media.id}/details`
                : `/manage-media/${media.id}/details`
            }
          >
            <div className="p-4">
              <div
                title={media.originalName}
                className="group-hover:invisible break-all drop-shadow-2xl line-clamp-1 text-sm font-semibold"
              >
                {media.originalName}
              </div>
            </div>

            {currentDuration ? (
              <div className="absolute w-full bottom-0 z-[21]">
                <Progress value={progressValue} />
              </div>
            ) : null}
          </Link>
          <Popover>
            <PopoverTrigger>
              <div className="w-8 py-4 pr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <EllipsisVerticalIcon />
              </div>
            </PopoverTrigger>
            <PopoverContent align="end" side="top">
              <div className="flex justify-end w-full gap-3">
                {loading ? (
                  <Spinner />
                ) : (
                  <React.Fragment>
                    <Link to={`/manage-media/${media.id}/details`}>
                      <IconButton>
                        <InformationCircleIcon />
                      </IconButton>
                    </Link>
                    <IconButton onClick={() => copyLink(`/media-play/${media.id}`)}>
                      <div className="w-3.5 mt-0.5 ml-0.5">
                        <LinkIcon />
                      </div>
                    </IconButton>
                    <IconButton onClick={() => deleteMedia(media.id)}>
                      <TrashIcon />
                    </IconButton>
                  </React.Fragment>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className={cs('h-[0px] -bottom-[52px] absolute w-full group-hover:h-[52px]')}></div>
      </div>
    </Card>
  );
};

export default MediaCard;
