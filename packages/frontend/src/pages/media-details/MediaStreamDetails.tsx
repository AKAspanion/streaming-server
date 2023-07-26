import React from 'react';
import { FC, useMemo } from 'react';

interface MediaStreamDetailsProps {
  title: string;
  stream: MediaStreamType;
}

const MediaStreamDetails: FC<MediaStreamDetailsProps> = ({ stream, title }) => {
  const streamValues = useMemo(() => {
    return Object.keys(stream)
      .filter((k) => stream[k] && typeof stream[k] === 'string')
      .map((key) => ({ name: key, value: stream[key] || '' }));
  }, [stream]);

  return (
    <div className="max-w-fit">
      <div className="pb-2 font-semibold">{title}</div>
      <div className="rounded-lg shadow-md overflow-hidden dark:bg-slate-800 bg-slate-200 p-4">
        <div style={{ gridTemplateColumns: 'auto 1fr' }} className={'text-sm grid transition-all'}>
          {streamValues.map(({ name, value }) => (
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
  );
};

export default MediaStreamDetails;
