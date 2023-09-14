import Spinner from '@components/atoms/spinner/Spinner';
import { FolderIcon } from '@heroicons/react/24/solid';
import { useAddMediaMutation, useGetMediaQuery } from '@services/media';
import MediaCard from '@/components/MediaCard';
import { useGetFolderQuery } from '@/services/folder';
import { Link } from 'react-router-dom';
import ManageMediaHeader from './ManageMediaHeader';
import NoData from '@/components/NoData';
import SectionGrid from '@/components/SectionGrid';
import { useState } from 'react';

const ManageMedia = () => {
  const { data, isFetching } = useGetMediaQuery('');
  const { data: folderData, isFetching: isFolderFetching } = useGetFolderQuery(
    new Date().toString(),
  );
  const [addMedia, { isLoading }] = useAddMediaMutation();

  const [addLoading, setAddLoading] = useState(false);

  const handleFileSubmit = (files: FileLocationType[]) => {
    setAddLoading(true);
    Promise.allSettled(files.map((file) => addMedia({ file })));
    setAddLoading(false);
  };

  const mediaList = data?.data || [];

  const folderList = folderData?.data || [];

  const loading = isFetching || isLoading || isFolderFetching || addLoading;

  const noData = mediaList.length === 0 && folderList.length === 0 && !loading;

  return loading ? (
    <Spinner full />
  ) : (
    <div className="relative h-full">
      <ManageMediaHeader
        title="Media Stream"
        subtitle="Add any media file here to stream."
        onFileSubmit={handleFileSubmit}
      />
      <div
        style={
          {
            '--managemediafolder-content-h': 'calc(100% - var(--media-header-height) - 32px)',
            '--managemediafolder-content-h-md': 'calc(100% - var(--media-header-height-md) - 32px)',
          } as React.CSSProperties
        }
        className="h-[var(--managemediafolder-content-h)] md:h-[var(--managemediafolder-content-h-md)] overflow-y-auto"
      >
        {noData && (
          <NoData
            className="py-8 px-4"
            title="No media found"
            description="Go ahead and create some folder and add your media!"
          />
        )}
        {folderList.length ? (
          <div className="px-4 pb-4">
            <div className="pt-4 font-bold">Folders</div>
            <SectionGrid>
              {(folderData?.data || []).map((f) => (
                <Link key={f.id} to={`/manage-media/${f.id}/folder`}>
                  <div className="flex gap-3 items-center rounded-md w-full cursor-pointer">
                    <div className="w-12 text-yellow-300">
                      <FolderIcon />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold">{f?.name}</div>
                      <div className="text-xs opacity-70">
                        {f?.totalFiles == 1 ? '1 File' : (f?.totalFiles || 'No') + ' Files'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </SectionGrid>
          </div>
        ) : null}
        {mediaList.length ? (
          <div className="px-4 pb-4">
            <div className="pt-4 font-bold">Videos</div>
            <SectionGrid>
              {mediaList?.map((m) => {
                return (
                  <div key={m.id}>
                    <MediaCard media={m} backTo="/manage-media" />
                  </div>
                );
              })}
            </SectionGrid>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ManageMedia;
