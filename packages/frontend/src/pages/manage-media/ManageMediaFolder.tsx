import React, { FC } from 'react';
import ManageMediaHeader from './ManageMediaHeader';
import { folderApi, useGetFolderByIdQuery, useGetMediaInFolderQuery } from '@/services/folder';
import { useParams } from 'react-router-dom';
import Spinner from '@/components/atoms/spinner/Spinner';
import { useAddMediaMutation } from '@/services/media';
import MediaCard from '@/components/MediaCard';
import { useDispatch } from 'react-redux';
import { FilmIcon, TvIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { normalizeText } from '@common/utils/validate';
import FullError from '@/components/FullError';
import { FolderOpenIcon } from '@heroicons/react/24/solid';
import NoData from '@/components/NoData';

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

  const notFound = !folderData?.data?.id && !isLoading;

  const hasMedia = mediaList.length !== 0;

  return loading ? (
    <Spinner full />
  ) : notFound ? (
    <FullError
      description="The folder you are looking for is not available!"
      icon={<FolderOpenIcon />}
    />
  ) : (
    <div className="relative h-full">
      <ManageMediaHeader
        isFolder
        folderId={folder?.id}
        title={normalizeText(folder?.name)}
        subtitle={normalizeText(folder?.description)}
        tag={
          <div className="w-5 pt-0.5 opacity-50" title={`${normalizeText(folder?.category)}`}>
            {getCategoryIcon()}
          </div>
        }
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
        {hasMedia ? (
          <div className="px-4 pb-4">
            <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4">
              {mediaList?.map((m) => {
                return (
                  <div key={m.id}>
                    <MediaCard media={m} folderId={folderId} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <NoData
            className="py-8 px-4"
            description="Go ahead and add some video files in this folder!"
          />
        )}
      </div>
    </div>
  );
};

export default ManageMediaFolder;
