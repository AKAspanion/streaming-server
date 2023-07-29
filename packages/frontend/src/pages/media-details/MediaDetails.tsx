/* eslint-disable @typescript-eslint/no-explicit-any */
import Spinner from '@components/atoms/spinner/Spinner';
import { baseUrl } from '@config/api';
import useToastStatus from '@hooks/useToastStatus';
import { useGetMediaByIdQuery } from '@services/media';
import React from 'react';
import { FC, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import MediaStreamDetails from './MediaStreamDetails';
import { cs, formatBytes, formatHumanSeconds, formatSeconds, titleCase } from '@utils/helpers';
import { FilmIcon, PlayIcon } from '@heroicons/react/24/solid';
import { TagIcon } from '@heroicons/react/20/solid';
import Button from '@components/atoms/button/Button';
import IconButton from '@components/atoms/icon-button/IconButton';

interface MediaDetailsProps {}

const MediaDetails: FC<MediaDetailsProps> = () => {
  const { mediaId = '' } = useParams();

  const { data: mediaData, isFetching, status } = useGetMediaByIdQuery(mediaId);

  const loading = isFetching;

  const media = useMemo(() => mediaData?.data || ({} as MediaTypeFull), [mediaData?.data]);

  useToastStatus(status, {
    errorMessage: 'Failed to load media details',
  });

  const details = useMemo(() => {
    return [
      { name: 'Original Name', value: media.originalName || '' },
      { name: 'ID', value: media.id || '' },
      { name: 'Duration', value: formatSeconds(media?.format?.duration || 0) },
      { name: 'File Size', value: formatBytes(media?.format?.size || 0) },
      { name: 'Format Name', value: media?.format?.format_long_name || '' },
      { name: 'Mime Type', value: media?.mimeType || '' },
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

  return (
    <div>
      {loading ? (
        <Spinner full />
      ) : (
        <div className="p-3">
          <div className="min-h-[400px] flex gap-3">
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
              <div className="flex gap-2 text-sm">
                {[
                  formatBytes(media?.format?.size || 0),
                  formatHumanSeconds(media?.format?.duration),
                ]
                  .filter(Boolean)
                  .join(' ｜ ')}
              </div>
              <div className="flex">
                <Link to={`/media-play/${media.id}`}>
                  <Button>
                    <div className="flex gap-2 items-center">
                      Play
                      <div className="w-4">
                        <PlayIcon />
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
              <div className="pt-4 flex flex-col lg:flex-row gap-3 h-full items-stretch">
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
