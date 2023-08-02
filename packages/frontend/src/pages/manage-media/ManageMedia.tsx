import FilePicker from '@components/FilePicker';
import Modal from '@components/atoms/modal/Modal';
import Spinner from '@components/atoms/spinner/Spinner';
import { FolderIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useAddMediaMutation, useGetMediaQuery } from '@services/media';
import { useState } from 'react';
import MediaCard from './MediaCard';
import { Button } from '@/components/ui/button';
import AddMediaFolder from './AddMediaFolder';
import { useGetFolderQuery } from '@/services/folder';

const ManageMedia = () => {
  const { data, isFetching } = useGetMediaQuery('');
  const { data: folderData, isFetching: isFolderFetching } = useGetFolderQuery('');
  const [addMedia, { isLoading }] = useAddMediaMutation();
  const [open, setOpen] = useState(false);

  const handleFileSubmit = (files: FileLocationType[]) => {
    setOpen(false);

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
        <div className="flex justify-between">
          <div>
            <div className="text-xl font-semibold">Media Stream</div>
            <div className="text-sm opacity-60">Add any media file here to stream.</div>
          </div>
          <div className="flex gap-3">
            <AddMediaFolder />
            <Button onClick={() => setOpen(true)}>
              <div className="flex gap-2 items-center">
                <div>Add Media</div>
                <div className="w-4">
                  <PlusIcon />
                </div>
              </div>
            </Button>
          </div>
        </div>
        {folderList.length ? (
          <div>
            <div className="pt-6 font-bold">Folders</div>
            <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4 py-4">
              {(folderData?.data || []).map((f) => (
                <div className="flex gap-3 items-center rounded-md w-full cursor-pointer">
                  <div className="w-12 text-yellow-300">
                    <FolderIcon />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold">{f.name}</div>
                    <div className="text-xs opacity-70">2 files</div>
                  </div>
                </div>
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
        <Modal title={'Select Video Files'} open={open} onClose={() => setOpen(false)}>
          <FilePicker onSubmit={handleFileSubmit} />
        </Modal>
      </div>
    </div>
  );
};

export default ManageMedia;
