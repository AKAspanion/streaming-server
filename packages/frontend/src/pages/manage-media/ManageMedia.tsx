import Spinner from '@components/atoms/spinner/Spinner';
import { FolderIcon } from '@heroicons/react/24/solid';
import { useAddMediaMutation, useGetMediaQuery } from '@services/media';
import MediaCard from './MediaCard';
import { useGetFolderQuery } from '@/services/folder';
import { Link } from 'react-router-dom';
import ManageMediaHeader from './ManageMediaHeader';
import NoData from '@/components/NoData';

const ManageMedia = () => {
  const { data, isFetching } = useGetMediaQuery('');
  const { data: folderData, isFetching: isFolderFetching } = useGetFolderQuery('');
  const [addMedia, { isLoading }] = useAddMediaMutation();

  const handleFileSubmit = (files: FileLocationType[]) => {
    files.forEach((f) => {
      addMedia({ file: f });
    });
  };

  const mediaList = data?.data || [];

  const folderList = folderData?.data || [];

  const loading = isFetching || isLoading || isFolderFetching;

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
            <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4 pt-4">
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
            </div>
          </div>
        ) : null}
        {mediaList.length ? (
          <div className="px-4 pb-4">
            <div className="pt-4 font-bold">Videos</div>
            <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4 pt-4">
              {mediaList?.map((m) => {
                return (
                  <div key={m.id}>
                    <MediaCard media={m} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ManageMedia;
