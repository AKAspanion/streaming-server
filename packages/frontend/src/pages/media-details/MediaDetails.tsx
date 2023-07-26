/* eslint-disable @typescript-eslint/no-explicit-any */
import Spinner from '@components/atoms/spinner/Spinner';
import { baseUrl } from '@config/api';
import useToastStatus from '@hooks/useToastStatus';
import { useGetMediaByIdQuery } from '@services/media';
import React from 'react';
import { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import MediaStreamDetails from './MediaStreamDetails';
import { formatBytes, formatSeconds } from '@utils/helpers';

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

  return (
    <div>
      {loading && <Spinner full />}
      <div className="p-3">
        <div className="h-96 flex gap-3">
          <div className="w-64  bg-slate-300 rounded-lg overflow-hidden">
            {media.id && (
              <img
                src={`${baseUrl}/media/${media.id}/thumbnail`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="pb-2 pt-4 text-lg">Media Details</div>
        <div className="dark:bg-slate-800 bg-slate-200 py-2 h-full flex flex-1 rounded-md">
          <div
            style={{ gridTemplateColumns: 'auto 1fr' }}
            className={' px-3 text-sm grid transition-all'}
          >
            {details.map(({ name, value }) => (
              <React.Fragment key={name}>
                <div className="whitespace-nowrap pr-4 pb-1 font-semibold">{name}</div>
                <div title={value} className="break-all pb-1">
                  {value}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <MediaStreamDetails streams={media?.streams} />
      </div>
    </div>
  );
};

export default MediaDetails;
