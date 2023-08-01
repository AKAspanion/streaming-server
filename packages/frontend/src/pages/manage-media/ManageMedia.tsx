import FilePicker from '@components/FilePicker';
import Modal from '@components/atoms/modal/Modal';
import Spinner from '@components/atoms/spinner/Spinner';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useAddMediaMutation, useGetMediaQuery } from '@services/media';
import { useState } from 'react';
import MediaCard from './MediaCard';
import { Button } from '@/components/ui/button';

const ManageMedia = () => {
  const { data, isFetching } = useGetMediaQuery('');
  const [addMedia, { isLoading }] = useAddMediaMutation();
  const [open, setOpen] = useState(false);

  const handleFileSubmit = (files: FileLocationType[]) => {
    setOpen(false);

    files.forEach((f) => {
      addMedia({ file: f });
    });
  };

  const mediaList = data?.data || [];

  const loading = isFetching || isLoading;

  return (
    <div className="relative h-full">
      {loading ? <Spinner full /> : null}
      <div className="p-4">
        <div className="flex justify-between">
          <div>
            <div className="text-2xl font-semibold">Media Stream</div>
            <div className="text-sm">Add any media file here to stream.</div>
          </div>
          <Button onClick={() => setOpen(true)}>
            <div className="flex gap-2 items-center">
              <div>Add Media</div>
              <div className="w-4">
                <PlusIcon />
              </div>
            </div>
          </Button>
        </div>
        <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4 py-4">
          {mediaList?.map((m) => {
            return (
              <div key={m.id}>
                <MediaCard media={m} />
              </div>
            );
          })}
        </div>
        <Modal title={'Select Video Files'} open={open} onClose={() => setOpen(false)}>
          <FilePicker onSubmit={handleFileSubmit} />
        </Modal>
      </div>
    </div>
  );
};

export default ManageMedia;
