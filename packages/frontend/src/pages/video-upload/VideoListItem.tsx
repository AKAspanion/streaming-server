import React, { FC, useMemo, useRef, useState } from 'react';
import { buttonVariant } from '@components/button';
import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/solid';
import { PlayIcon } from '@heroicons/react/24/solid';
import Spinner from '@components/spinner/Spinner';
import Button from '@components/button/Button';

interface VideoListItemProps {
  video: VideoType;
  loading: boolean;
  onDelete: (v: VideoType) => Promise<void>;
  onSubtitle: (v: VideoType, srt?: File) => Promise<void>;
}

const VideoListItem: FC<VideoListItemProps> = ({ video, loading, onDelete, onSubtitle }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const handleSubtitleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        await onSubtitle(video, e.target.files[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openFile = () => {
    const subInputDom = ref.current;
    if (subInputDom) {
      subInputDom.click();
    }
  };

  const handleDetails = () => {
    setOpen((o) => !o);
  };

  const details = useMemo(() => {
    return [
      { name: 'Original Name', value: video.originalname },
      { name: 'ID', value: video.id },
      { name: 'File Size', value: video.size },
      { name: 'Encoding', value: video.encoding },
      { name: 'Mime Type', value: video.mimetype },
      { name: 'Field Name', value: video.fieldname },
    ];
  }, [video.encoding, video.fieldname, video.id, video.mimetype, video.originalname, video.size]);

  return (
    <div className="bg-slate-300 dark:bg-slate-800 p-2 px-4 rounded-md  mb-4">
      {loading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div
            style={
              {
                '--max-list-item': 'calc(100vw - 240px)',
              } as React.CSSProperties
            }
            className="flex items-center gap-4 justify-between"
          >
            <div
              className="cursor-pointer select-none w-[var(--max-list-item)] overflow-hidden overflow-ellipsis whitespace-nowrap"
              title={video.originalname}
              onClick={handleDetails}
            >
              {video.originalname}
            </div>
            <div className="text-lg flex">
              <Button onClick={() => openFile()}>
                <p className="font-bold">CC</p>
              </Button>
              <Button onClick={() => onDelete(video)}>
                <div className="w-5">
                  <TrashIcon />
                </div>
              </Button>
              <Link {...buttonVariant()} to={`/video-play/${video.id}`}>
                <div className="w-5">
                  <PlayIcon />
                </div>
              </Link>

              <input
                type="file"
                ref={ref}
                accept=".srt"
                className="invisible fixed pointer-events-none left-0"
                onChange={handleSubtitleLoad}
              />
            </div>
          </div>
          <div
            style={{ gridTemplateColumns: 'auto 1fr' }}
            className={
              'dark:bg-slate-900 bg-slate-200 rounded-md px-3 text-sm grid transition-all' +
              (!open ? ' h-0 overflow-hidden' : ' h-auto py-2 my-2')
            }
          >
            {details.map(({ name, value }) => (
              <React.Fragment key={name}>
                <div className="whitespace-nowrap pr-4 pb-1">{name}</div>
                <div className="break-all pb-1">{value}</div>
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoListItem;
