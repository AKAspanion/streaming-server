import ClosedCaptionIcon from '@components/icons/ClosedCaptionIcon';
import { VideoCameraIcon } from '@heroicons/react/20/solid';
import { MusicalNoteIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { titleCase } from '@utils/helpers';
import React from 'react';
import { FC, useMemo } from 'react';

interface MediaStreamDetailsProps {
  streams?: MediaStreamType[];
}

const MediaStreamDetails: FC<MediaStreamDetailsProps> = ({ streams }) => {
  const allStreams = useMemo(() => {
    const all = [];
    const videoStreams = (streams || []).filter(
      (s) => s?.codec_type === 'video' && s?.codec_name !== 'mjpeg',
    );
    if (videoStreams) {
      all.push({
        title: 'Video',
        list: videoStreams,
        icon: <VideoCameraIcon />,
      });
    }
    const audioStreams = (streams || []).filter((s) => s?.codec_type === 'audio');
    if (audioStreams) {
      all.push({
        title: 'Audio',
        list: audioStreams,
        icon: <MusicalNoteIcon />,
      });
    }
    const subStreams = (streams || []).filter((s) => s?.codec_type === 'attachment');
    if (subStreams) {
      all.push({
        title: 'Subtitle',
        list: subStreams,
        icon: <ClosedCaptionIcon />,
      });
    }
    const imageStreams = (streams || []).filter(
      (s) => s?.codec_type === 'video' && s?.codec_name === 'mjpeg',
    );
    if (imageStreams) {
      all.push({
        title: 'Image',
        list: imageStreams,
        icon: <PhotoIcon />,
      });
    }

    return all;
  }, [streams]);

  return (
    <div className="flex gap-3 overflow-x-auto">
      {allStreams.map(({ title, icon, list }) => {
        return list.length ? (
          <div key={title} className="flex flex-col gap-3 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-5">{icon}</div>
              <div>{title}</div>
            </div>
            {list.map((s) => {
              return <StreamItem stream={s} />;
            })}
          </div>
        ) : null;
      })}
    </div>
  );
};

const StreamItem = ({ stream }: { stream: MediaStreamType }) => {
  const streamValues = useMemo(() => {
    return Object.keys(stream)
      .filter((k) => stream[k] && (typeof stream[k] === 'string' || typeof stream[k] === 'number'))
      .map((key) => ({ name: titleCase(key), value: stream[key] || '' }));
  }, [stream]);

  return (
    <div className="max-w-fit rounded-lg shadow-md dark:bg-slate-800 bg-slate-200 p-3">
      <div
        style={{ gridTemplateColumns: 'auto 200px' }}
        className={'text-xs grid gap-x-3 gap-y-1 transition-all'}
      >
        {streamValues.map(({ name, value }, index) => (
          <React.Fragment key={name + index}>
            <div className="whitespace-nowrap font-semibold">{name}</div>
            <div title={value} className="break-all">
              {value}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MediaStreamDetails;
