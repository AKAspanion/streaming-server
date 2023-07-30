/* eslint-disable @typescript-eslint/no-explicit-any */
import Spinner from '@components/atoms/spinner/Spinner';
import { baseUrl } from '@config/api';
import useToastStatus from '@hooks/useToastStatus';
import { useGetMediaByIdQuery } from '@services/media';
import React from 'react';
import { FC, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MediaStreamDetails from './MediaStreamDetails';
import { cs, formatBytes, formatHumanSeconds, formatPercentage, titleCase } from '@utils/helpers';
import { EyeIcon, FilmIcon, HeartIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/solid';
import { TagIcon } from '@heroicons/react/20/solid';
import Button from '@components/atoms/button/Button';
import IconButton from '@components/atoms/icon-button/IconButton';
import useMediaMutation from '@hooks/useMediaMutation';
import Progress from '@components/atoms/progress/Progress';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaDetailsProps {}

const MediaDetails: FC<MediaDetailsProps> = () => {
  const navigate = useNavigate();
  const { mediaId = '' } = useParams();
  const {
    handleDelete,
    isDeleteLoading,
    markMediaFavourite,
    isMarkFavouriteLoading,
    markMediaWatched,
    isMarkWatchedLoading,
  } = useMediaMutation({
    onDelete: () => navigate('/manage-media'),
  });

  const { data: mediaData, isLoading, status } = useGetMediaByIdQuery(mediaId);

  const loading = isLoading || isDeleteLoading;
  const mutationLoading = isMarkFavouriteLoading || isMarkWatchedLoading;

  const media = useMemo(() => mediaData?.data || ({} as MediaTypeFull), [mediaData?.data]);

  useToastStatus(status, {
    errorMessage: 'Failed to load media details',
  });

  const details = useMemo(() => {
    return [
      { name: 'File Name', value: media.originalName || '' },
      { name: 'ID', value: media.id || '' },
      { name: 'Duration', value: formatHumanSeconds(media?.format?.duration || 0) },
      { name: 'File Size', value: formatBytes(media?.format?.size || 0) },
      { name: 'Format', value: media?.format?.format_long_name || '' },
      { name: 'Mime', value: media?.mimeType || '' },
      { name: 'Bit Rate', value: media?.format?.bit_rate || '' },
      { name: 'Location', value: media?.format?.filename || '' },
    ];
  }, [media?.format, media?.id, media?.mimeType, media.originalName]);

  const tags = useMemo(() => {
    const tagRecord = media?.format?.tags || {};
    return Object.keys(tagRecord).map((key) => ({
      name: titleCase(key),
      value: tagRecord[key] || '',
    }));
  }, [media?.format?.tags]);

  const mediaTitle = media?.format?.tags?.title || media.originalName || '-';

  const totalDuration = media?.format?.duration || 0;
  const currentDuration = media?.currentTime || 0;

  const progressValue = totalDuration ? formatPercentage(currentDuration, totalDuration) : 0;

  return (
    <div>
      {loading ? (
        <Spinner full />
      ) : (
        <div className="p-3">
          <div className="min-h-[336px] flex gap-3">
            <div className="w-96 bg-slate-300 rounded-lg overflow-hidden relative">
              {media.id && (
                <img
                  src={`${baseUrl}/media/${media.id}/thumbnail`}
                  className="w-full h-full object-cover"
                />
              )}
              <div
                className={cs(
                  'w-full h-full dark:bg-slate-800 bg-slate-500  absolute top-0 flex items-center justify-center',
                  'opacity-0 hover:opacity-50 transition-opacity',
                )}
              >
                <Link to={`/media-play/${media.id}`}>
                  <IconButton>
                    <PlayIcon />
                  </IconButton>
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="font-semibold text-2xl">
                <div>{mediaTitle}</div>
              </div>
              {/* <div className="flex gap-2 text-sm">
                {[
                  formatBytes(media?.format?.size || 0),
                  formatHumanSeconds(media?.format?.duration),
                ]
                  .filter(Boolean)
                  .join(' ｜ ')}
              </div> */}
              {mutationLoading ? (
                <div className="flex gap-3">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-10" />
                  <Skeleton className="h-9 w-10" />
                  <Skeleton className="h-9 w-10" />
                </div>
              ) : (
                <div className="flex gap-3">
                  {progressValue ? (
                    <Link to={`/media-play/${media.id}?resume=${currentDuration}`}>
                      <Button>
                        <div className="flex gap-2 items-center">
                          Resume
                          <div className="w-4">
                            <PlayIcon />
                          </div>
                        </div>
                      </Button>
                    </Link>
                  ) : null}
                  <Link to={`/media-play/${media.id}`}>
                    <Button>
                      <div className="flex gap-2 items-center">
                        {progressValue ? 'Play From Start' : 'Play'}
                        <div className="w-4">
                          <PlayIcon />
                        </div>
                      </div>
                    </Button>
                  </Link>
                  <Button onClick={() => markMediaFavourite(media.id)}>
                    <div className={cs('w-5', { 'text-red-500': media?.isFavourite })}>
                      <HeartIcon />
                    </div>
                  </Button>
                  <Button onClick={() => markMediaWatched(media.id)}>
                    <div className={cs('w-5', { 'text-green-500': media?.watched })}>
                      <EyeIcon />
                    </div>
                  </Button>
                  <Button onClick={() => handleDelete(media.id)}>
                    <div className="flex gap-2 items-center">
                      Delete
                      <div className="w-4">
                        <TrashIcon />
                      </div>
                    </div>
                  </Button>
                </div>
              )}
              {progressValue ? <Progress rounded value={progressValue} /> : null}
              <div className="pt-1 flex flex-col lg:flex-row gap-3 h-full items-stretch">
                <MediaDetailsGrid title="Media Details" list={details} icon={<FilmIcon />} />
                <MediaDetailsGrid title="Tag Details" list={tags} icon={<TagIcon />} />
              </div>
            </div>
          </div>

          <MediaStreamDetails streams={media?.streams} />
        </div>
      )}
    </div>
  );
};

const MediaDetailsGrid = (props: {
  list: { name: string; value: string }[];
  icon: React.ReactNode;
  title: React.ReactNode;
}) => {
  const { list, icon, title } = props;

  return list.length ? (
    <div className="dark:bg-slate-800 bg-slate-200 py-2 flex flex-col flex-1 rounded-md">
      <div className="flex items-center gap-3 pb-3 pl-3">
        <div className="w-5">{icon}</div>
        <div className="">{title}</div>
      </div>
      <div
        style={{ gridTemplateColumns: 'auto 1fr' }}
        className={' px-3 text-sm grid transition-all'}
      >
        {list.map(({ name, value }) => (
          <React.Fragment key={name}>
            <div className="whitespace-nowrap pr-4 pb-1 font-semibold">{name}</div>
            <div title={value} className="break-all pb-1">
              {value}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  ) : null;
};

export default MediaDetails;
