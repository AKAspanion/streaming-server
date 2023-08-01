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
import IconButton from '@components/atoms/icon-button/IconButton';
import useMediaMutation from '@hooks/useMediaMutation';
import Progress from '@components/atoms/progress/Progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MediaSubtitleDetails from './MediaSubtitleDetails';
import { Button } from '@/components/ui/button';

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
    updateAudio,
    isAudioUpdating,
  } = useMediaMutation({
    onDelete: () => navigate('/manage-media'),
  });

  const { data: mediaData, isLoading, status } = useGetMediaByIdQuery(mediaId);

  const loading = isLoading || isDeleteLoading;
  const mutationLoading = isMarkFavouriteLoading || isMarkWatchedLoading || isAudioUpdating;

  const media = useMemo(() => mediaData?.data || ({} as MediaTypeFull), [mediaData?.data]);

  useToastStatus(status, {
    errorMessage: 'Failed to load media details',
  });

  const details = useMemo(() => {
    return [
      { name: 'File Name', value: media.originalName || '' },
      // { name: 'ID', value: media.id || '' },
      { name: 'Duration', value: formatHumanSeconds(media?.format?.duration || 0) },
      { name: 'File Size', value: formatBytes(media?.format?.size || 0) },
      { name: 'Format', value: media?.format?.format_long_name || '' },
      // { name: 'Mime', value: media?.mimeType || '' },
      { name: 'Bit Rate', value: media?.format?.bit_rate || '' },
      { name: 'Location', value: media?.format?.filename || '' },
    ];
  }, [media?.format, media.originalName]);

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
        <div className="flex flex-col gap-3 p-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="bg-slate-300 dark:bg-slate-800 rounded-lg overflow-hidden relative">
              <div className="h-full md:w-[336px]">
                {media.id && (
                  <img
                    src={`${baseUrl}/media/${media.id}/thumbnail`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div
                className={cs(
                  'w-full h-full dark:bg-slate-800 bg-slate-500 absolute top-0 flex items-center justify-center',
                  'opacity-0 hover:opacity-50 transition-opacity',
                )}
              >
                <Link to={`/media-play/${media.id}`}>
                  <IconButton className="text-green-500">
                    <PlayIcon />
                  </IconButton>
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <div className="font-semibold break-all text-2xl pt-3">
                <div className="line-clamp-2">{mediaTitle}</div>
              </div>
              {mutationLoading ? (
                <div className="flex gap-3">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-10" />
                  <Skeleton className="h-9 w-10" />
                  <Skeleton className="h-9 w-10" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {progressValue ? (
                    <Link to={`/media-play/${media.id}?resume=${currentDuration}`}>
                      <Button variant={'secondary'}>
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
                    <Button variant={'secondary'}>
                      <div className="flex gap-2 items-center">
                        {progressValue ? 'Play From Start' : 'Play'}
                        <div className="w-4">
                          <PlayIcon />
                        </div>
                      </div>
                    </Button>
                  </Link>
                  <Button variant={'secondary'} onClick={() => markMediaFavourite(media.id)}>
                    <div className={cs('w-5', { 'text-red-500': media?.isFavourite })}>
                      <HeartIcon />
                    </div>
                  </Button>
                  <Button variant={'secondary'} onClick={() => markMediaWatched(media.id)}>
                    <div className={cs('w-5', { 'text-green-500': media?.watched })}>
                      <EyeIcon />
                    </div>
                  </Button>
                  <MediaSubtitleDetails id={media.id} data={media?.sub} />

                  <div className="flex gap-2 items-center">
                    <Select
                      value={media?.selectedAudio}
                      onValueChange={(v) => updateAudio({ id: media?.id, index: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Audio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Select Audio</SelectLabel>
                          {(media?.audioStreams || []).map((stream) => {
                            return (
                              <SelectItem
                                key={stream?.index}
                                value={`${stream?.index}`}
                              >{`Audio: ${[
                                stream?.tags?.title || '',
                                titleCase(stream?.tags?.language || ''),
                              ]
                                .filter(Boolean)
                                .join(' - ')}`}</SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant={'secondary'} onClick={() => handleDelete(media.id)}>
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
            </div>
          </div>
          <div className="pt-1 flex flex-col lg:flex-row gap-3 h-full items-stretch">
            <MediaDetailsGrid title="Media Details" list={details} icon={<FilmIcon />} />
            <MediaDetailsGrid title="Tag Details" list={tags} icon={<TagIcon />} />
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
