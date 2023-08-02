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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CoverButton from '@/components/CoverButton';

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
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <CoverButton
              button={
                <Link to={`/media-play/${media.id}`}>
                  <Button variant={'ghost'} className="text-green-500">
                    <div className="w-10">
                      <PlayIcon />
                    </div>
                  </Button>
                </Link>
              }
            >
              <Card className="h-full md:w-[336px]">
                {media.id && (
                  <img
                    src={`${baseUrl}/media/${media.id}/thumbnail`}
                    className="w-full h-full object-cover"
                  />
                )}
              </Card>
            </CoverButton>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  <div className="line-clamp-2">{mediaTitle}</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {mutationLoading ? (
                    <div className="flex gap-4">
                      <Skeleton className="h-9 w-16" />
                      <Skeleton className="h-9 w-10" />
                      <Skeleton className="h-9 w-10" />
                      <Skeleton className="h-9 w-10" />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      {progressValue ? (
                        <Link to={`/media-play/${media.id}?resume=${currentDuration}`}>
                          <Button variant={!progressValue ? 'secondary' : undefined}>
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
                        <Button variant={progressValue ? 'secondary' : undefined}>
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
              </CardContent>
            </Card>
          </div>
          <div className="pt-1 flex flex-col lg:flex-row gap-4 h-full items-stretch">
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
    <Card className="py-2 flex flex-col flex-1">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-4">
            <div className="w-5">{icon}</div>
            <div className="">{title}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ gridTemplateColumns: 'auto 1fr' }} className={'text-sm grid transition-all'}>
          {list.map(({ name, value }) => (
            <React.Fragment key={name}>
              <div className="whitespace-nowrap pr-4 pb-1 font-semibold">{name}</div>
              <div title={value} className="break-all pb-1">
                {value}
              </div>
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  ) : null;
};

export default MediaDetails;
