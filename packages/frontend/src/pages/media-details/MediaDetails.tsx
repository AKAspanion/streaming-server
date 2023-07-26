/* eslint-disable @typescript-eslint/no-explicit-any */
import Spinner from '@components/atoms/spinner/Spinner';
import { baseUrl } from '@config/api';
import useToastStatus from '@hooks/useToastStatus';
import { useGetMediaByIdQuery } from '@services/media';
import React from 'react';
import { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import MediaStreamDetails from './MediaStreamDetails';

interface MediaDetailsProps {}

const MediaDetails: FC<MediaDetailsProps> = () => {
  const { mediaId = '' } = useParams();

  const { data: mediaData, isFetching, status } = useGetMediaByIdQuery(mediaId);

  const loading = isFetching;

  const media = useMemo(() => mediaData?.data || ({} as MediaTypeFull), [mediaData?.data]);

  const audioStreams = useMemo(() => {
    return (media?.streams || []).filter((s: any) => s?.codec_type === 'audio');
  }, [media?.streams]);

  const videoStreams = useMemo(() => {
    return (media?.streams || []).filter((s: any) => s?.codec_type === 'video');
  }, [media?.streams]);

  useToastStatus(status, {
    errorMessage: 'Failed to load media details',
  });

  const details = useMemo(() => {
    return [
      { name: 'Original Name', value: media.originalName || '' },
      { name: 'ID', value: media.id || '' },
      { name: 'Mime Type', value: media?.mimeType || '' },
      { name: 'File Size', value: media?.format?.size || '' },
      { name: 'Format Name', value: media?.format?.format_long_name || '' },
      { name: 'Bit Rate', value: media?.format?.bit_rate || '' },
      { name: 'Duration', value: media?.format?.duration || '' },
      { name: 'Location', value: media?.format?.filename || '' },
    ];
  }, [media?.format, media?.id, media?.mimeType, media.originalName]);
  console.log(audioStreams, videoStreams);

  return (
    <div>
      {loading && <Spinner full />}
      <div className="p-3">
        <div className="pb-2 font-semibold">Media Details</div>
        <div className="h-52 flex gap-3">
          <div className="w-64  bg-slate-300 rounded-lg overflow-hidden">
            {media.id && (
              <img
                src={`${baseUrl}/media/${media.id}/thumbnail`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="dark:bg-slate-800 bg-slate-200 py-2 h-full flex flex-1 rounded-md">
            <div
              style={{ gridTemplateColumns: 'auto 1fr' }}
              className={' px-3 text-sm grid transition-all'}
            >
              {details.map(({ name, value }) => (
                <React.Fragment key={name}>
                  <div className="whitespace-nowrap pr-4 pb-1 font-semibold">{name}</div>
                  <div
                    title={value}
                    className="break-all pb-1 whitespace-nowrap text-ellipsis overflow-hidden"
                  >
                    {value}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <div>
            {videoStreams.length > 0 &&
              videoStreams.map((s) => <MediaStreamDetails title="Video Streams" stream={s} />)}
          </div>
          <div>
            {audioStreams.length > 0 &&
              audioStreams.map((s) => <MediaStreamDetails title="Audio Streams" stream={s} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetails;
