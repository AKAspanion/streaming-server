import React, { FC, useMemo, useRef, useState } from 'react';
import { buttonVariant } from '@components/atoms/button';
import { Link } from 'react-router-dom';
import { LinkIcon, TrashIcon } from '@heroicons/react/24/solid';
import { PlayIcon } from '@heroicons/react/24/solid';
import Spinner from '@components/atoms/spinner/Spinner';
import Button from '@components/atoms/button/Button';
import { toast } from 'react-hot-toast/headless';
import { copyTextToClipboard } from '@utils/dom';
import { getNetworkFEUrl } from '@/config/app';
import { cs } from '@/utils/helpers';
import Modal from '@/components/atoms/modal/Modal';
import ClosedCaptionIcon from '@/components/icons/ClosedCaptionIcon';
import Image from '@/components/atoms/image/Image';
import { getNetworkAPIUrlWithAuth } from '@/config/api';

interface VideoListItemProps {
  isGrid?: boolean;
  video: VideoType;
  loading: boolean;
  onDelete: (v: VideoType) => Promise<void>;
  onSubtitle: (v: VideoType, srt?: File) => Promise<void>;
}

const VideoListItem: FC<VideoListItemProps> = ({
  isGrid,
  video,
  loading,
  onDelete,
  onSubtitle,
}) => {
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

  const copyLink = async (txt: string) => {
    const link = getNetworkFEUrl(txt);
    const res = await copyTextToClipboard(link);
    if (res) toast.success('Network link copied');
    else toast.error('Failed to copy link');
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

  const VideoDetails = () => (
    <React.Fragment>
      {details.map(({ name, value }) => (
        <React.Fragment key={name}>
          <div className="whitespace-nowrap pr-4 pb-1 font-medium">{name}</div>
          <div className="break-all pb-1">{value}</div>
        </React.Fragment>
      ))}
    </React.Fragment>
  );

  return (
    <div className="bg-slate-300 dark:bg-slate-800 rounded-md  mb-4">
      {loading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="h-40 rounded-lg overflow-hidden">
            <Image
              fallback="/fallback-video.svg"
              src={getNetworkAPIUrlWithAuth(`/video/${video?.id}/thumbnail`)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="p-2 px-4">
            <div
              style={
                {
                  '--max-list-item': isGrid ? 'calc(100%)' : 'calc(100vw - 240px)',
                } as React.CSSProperties
              }
              className={cs('flex  justify-between', {
                'flex-col items-start gap-2': isGrid,
                'items-center gap-4': !isGrid,
              })}
            >
              <div
                className="cursor-pointer select-none w-[var(--max-list-item)] overflow-hidden overflow-ellipsis whitespace-nowrap"
                title={video.originalname}
                onClick={handleDetails}
              >
                {video.originalname}
              </div>
              <div className={cs('text-lg flex', { 'justify-between w-full': isGrid })}>
                <Button onClick={() => copyLink(`/video-play/${video.id}`)}>
                  <div title="Copy network link" className="w-4 mt-0.5">
                    <LinkIcon />
                  </div>
                </Button>
                <Button onClick={() => openFile()}>
                  <div title="Add subtitle" className={cs('w-6', { 'opacity-30': !video?.subs })}>
                    <ClosedCaptionIcon />
                  </div>
                </Button>
                <Button onClick={() => onDelete(video)}>
                  <div title="Delete video" className="w-5">
                    <TrashIcon />
                  </div>
                </Button>
                <Link {...buttonVariant()} to={`/video-play/${video.id}`}>
                  <div title="Play video" className="w-5">
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
                (!open || isGrid ? ' h-0 overflow-hidden' : ' h-auto py-2 my-2')
              }
            >
              {isGrid ? null : <VideoDetails />}
            </div>
          </div>
        </>
      )}
      {isGrid && (
        <Modal title={'Video Info'} open={open} onClose={() => setOpen(false)}>
          <div style={{ gridTemplateColumns: 'auto 1fr' }} className={'grid'}>
            <VideoDetails />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VideoListItem;
