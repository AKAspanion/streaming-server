import { FC } from 'react';
import ManageMediaHeader from './ManageMediaHeader';
import { folderApi, useGetFolderByIdQuery, useGetMediaInFolderQuery } from '@/services/folder';
import { useParams } from 'react-router-dom';
import Spinner from '@/components/atoms/spinner/Spinner';
import { useAddMediaMutation } from '@/services/media';
import MediaCard from './MediaCard';
import { useDispatch } from 'react-redux';
import { FilmIcon, TvIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

interface ManageMediaFolderProps {}

const ManageMediaFolder: FC<ManageMediaFolderProps> = () => {
  const dispath = useDispatch();
  const { folderId = '' } = useParams();

  const [addMedia, { isLoading }] = useAddMediaMutation();
  const { data: folderData, isFetching } = useGetFolderByIdQuery(folderId);
  const { data: mediaData, isFetching: isMediaFetching } = useGetMediaInFolderQuery(folderId);

  const handleFileSubmit = async (files: FileLocationType[]) => {
    await Promise.all(files.map((f) => addMedia({ file: f, folderId }).unwrap()));

    dispath(folderApi.util.resetApiState());
  };

  const folder = folderData?.data;
  const mediaList = mediaData?.data || [];

  const loading = isLoading || isFetching || isMediaFetching;

  const getCategoryIcon = () => {
    if (folder?.category === 'movie') {
      return <FilmIcon />;
    } else if (folder?.category === 'tv') {
      return <TvIcon />;
    }
    return <VideoCameraIcon />;
  };

  return (
    <div className="p-4 relative h-full">
      {loading ? <Spinner full /> : null}
      <ManageMediaHeader
        isFolder
        folderId={folder?.id}
        title={folder?.name || ''}
        subtitle={folder?.description || ''}
        tag={
          <div className="w-5 pt-0.5 opacity-50" title={`${folder?.category || ''}`}>
            {getCategoryIcon()}
          </div>
        }
        onFileSubmit={handleFileSubmit}
      />
      {mediaList.length ? (
        <div>
          <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4 py-4">
            {mediaList?.map((m) => {
              return (
                <div key={m.id}>
                  <MediaCard media={m} folderId={folderId} />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ManageMediaFolder;
