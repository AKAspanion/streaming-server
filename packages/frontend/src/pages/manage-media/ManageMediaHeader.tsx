import { FC, useState } from 'react';
import AddEditMediaFolder from './AddEditMediaFolder';
import { Button } from '@/components/ui/button';
import Modal from '@/components/atoms/modal/Modal';
import { FolderIcon, PlusIcon } from '@heroicons/react/24/solid';
import FilePicker from '@/components/FilePicker';

interface ManageMediaHeaderProps {
  title: string;
  subtitle: string;
  folderId?: string;
  isFolder?: boolean;
  tag?: React.ReactNode;
  onFileSubmit?: (files: FileLocationType[]) => void;
}

const ManageMediaHeader: FC<ManageMediaHeaderProps> = ({
  tag,
  title,
  subtitle,
  folderId,
  isFolder,
  onFileSubmit,
}) => {
  const [open, setOpen] = useState(false);

  const handleFileSubmit = (files: FileLocationType[]) => {
    setOpen(false);
    onFileSubmit && onFileSubmit(files);
  };

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex gap-3 items-center">
          {isFolder && (
            <div>
              <div className="w-12 text-yellow-300">
                <FolderIcon />
              </div>
            </div>
          )}
          <div>
            <div className="flex gap-2 items-center">
              <div className="text-xl font-semibold">{title}</div>
              {tag && <div>{tag}</div>}
            </div>
            {subtitle && <div className="text-sm opacity-60">{subtitle}</div>}
          </div>
        </div>
        <div className="flex gap-3">
          <AddEditMediaFolder edit={isFolder} folderId={folderId} />
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

      <Modal title={'Select Video Files'} open={open} onClose={() => setOpen(false)}>
        <FilePicker onSubmit={handleFileSubmit} />
      </Modal>
    </div>
  );
};

export default ManageMediaHeader;
