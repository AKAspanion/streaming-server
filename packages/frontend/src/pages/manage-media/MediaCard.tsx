import IconButton from '@components/atoms/icon-button/IconButton';
import { baseUrl } from '@config/api';
import {
  ChatBubbleBottomCenterTextIcon,
  EllipsisVerticalIcon,
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
import { formatPercentage } from '@/utils/helpers';
import { Card } from '@/components/ui/card';
import CoverButton from '@/components/CoverButton';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { normalizeText } from '@common/utils/validate';

interface MediaCardProps {
  folderId?: string;
  media: MediaType;
}

const MediaCard: FC<MediaCardProps> = ({ media, folderId }) => {
  const { deleteMedia, isDeleteLoading } = useMediaMutation();

  const copyLink = async (txt: string) => {
    const res = await copyTextToClipboard(baseUrl + '/#' + txt);
    if (res) toast.success('Network link copied');
    else toast.error('Failed to copy link');
  };

  const loading = isDeleteLoading;
  const totalDuration = media?.format?.duration || 0;
  const currentDuration = media?.currentTime || 0;
  const progressValue = totalDuration ? formatPercentage(currentDuration, totalDuration) : 0;

  const hasSub = !!media.sub;

  return (
    <Card className="h-full ">
      <div className="transition-all h-full flex flex-col rounded-lg overflow-hidden">
        <CoverButton
          button={
            <Link
              to={`/media-play/${media.id}?resume=${currentDuration}&back=${normalizeText(
                folderId,
              )}`}
            >
              <Button variant={'ghost'} className="text-green-500">
                <div className="w-10">
                  <PlayIcon />
                </div>
              </Button>
            </Link>
          }
        >
          {hasSub && (
            <div className="absolute right-3 top-3 drop-shadow text-foreground">
              <div className="w-5 ">
                <ChatBubbleBottomCenterTextIcon />
              </div>
            </div>
          )}
          <div className="h-40 rounded-lg overflow-hidden">
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
        </CoverButton>
        <div className="flex gap-4 justify-between items-start p-4">
          <Link
            className="flex-1"
            to={
              folderId
                ? `/manage-media/${folderId}/folder/${media.id}/details`
                : `/manage-media/${media.id}/details`
            }
          >
            <div title={media.originalName} className="break-all text-sm">
              {media.originalName}
            </div>
          </Link>
          <Popover>
            <PopoverTrigger>
              <div className="w-5">
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
      </div>
    </Card>
  );
};

export default MediaCard;
