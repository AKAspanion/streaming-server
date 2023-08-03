import Spinner from '@components/atoms/spinner/Spinner';
import { FolderIcon } from '@heroicons/react/24/solid';
import { useAddMediaMutation, useGetMediaQuery } from '@services/media';
import MediaCard from './MediaCard';
import { useGetFolderQuery } from '@/services/folder';
import { Link } from 'react-router-dom';
import ManageMediaHeader from './ManageMediaHeader';

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

  return (
    <div className="relative h-full">
      {loading ? <Spinner full /> : null}
      <div className="p-4">
        <ManageMediaHeader
          title="Media Stream"
          subtitle="Add any media file here to stream."
          onFileSubmit={handleFileSubmit}
        />
        {folderList.length ? (
          <div>
            <div className="pt-6 font-bold">Folders</div>
            <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4 py-4">
              {(folderData?.data || []).map((f) => (
                <Link to={`/manage-media/${f.id}/folder`}>
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
          <div>
            <div className="pt-6 font-bold">Videos</div>
            <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4 py-4">
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
