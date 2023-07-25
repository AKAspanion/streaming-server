import FilePicker from '@components/FilePicker';
import Button from '@components/atoms/button/Button';
import Modal from '@components/atoms/modal/Modal';
import Spinner from '@components/atoms/spinner/Spinner';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useAddMediaMutation, useGetMediaQuery } from '@services/media';
import { useState } from 'react';
import MediaCard from './MediaCard';

const ManageMedia = () => {
  const { data, isFetching } = useGetMediaQuery('');
  const [addMedia, { isLoading }] = useAddMediaMutation();
  const [open, setOpen] = useState(false);

  const handleFileSubmit = (files: FileLocationType[]) => {
    setOpen(false);

    console.log(files);

    files.forEach((f) => {
      addMedia({ file: f });
    });
  };

  const mediaList = data?.data || [];

  const loading = isFetching || isLoading;

  return (
    <div className="p-3">
      {loading ? <Spinner full /> : null}
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <div className="flex gap-2 items-center">
            Add Media
            <div className="w-4">
              <PlusIcon />
            </div>
          </div>
        </Button>
      </div>
      <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 gap-3 py-3">
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
  );
};

export default ManageMedia;
