import FilePicker from '@components/FilePicker';
import Button from '@components/atoms/button/Button';
import Modal from '@components/atoms/modal/Modal';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

const ManageMedia = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-3">
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
      <Modal title={'Select Files'} open={open} onClose={() => setOpen(false)}>
        <FilePicker />
      </Modal>
    </div>
  );
};

export default ManageMedia;
