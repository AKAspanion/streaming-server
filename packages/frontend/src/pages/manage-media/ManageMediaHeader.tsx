import { FC, useState } from 'react';
import AddEditMediaFolder from './AddEditMediaFolder';
import { Button } from '@/components/ui/button';
import Modal from '@/components/atoms/modal/Modal';
import { FolderIcon, InformationCircleIcon, PlusIcon } from '@heroicons/react/24/solid';
import FilePicker from '@/components/FilePicker';
import { cs } from '@/utils/helpers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ManageMediaHeaderProps {
  info?: boolean;
  title: string;
  subtitle: string;
  folderId?: string;
  isFolder?: boolean;
  tag?: React.ReactNode;
  onFileSubmit?: (files: FileLocationType[]) => void;
}

const ManageMediaHeader: FC<ManageMediaHeaderProps> = ({
  tag,
  info,
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
    <div className="p-4">
      <div
        className={cs(
          'flex flex-col md:flex-row gap-4 justify-between flex-end',
          'h-[var(--media-header-height)] md:h-[var(--media-header-height-md)]',
        )}
      >
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
              <div className="text-xl line-clamp-1 font-semibold">{title}</div>
              {tag && <div>{tag}</div>}
            </div>
            <div className="flex gap-2">
              {subtitle && <div className="text-sm opacity-60">{subtitle}</div>}
              {info && (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger>
                      <div className="w-5">
                        <InformationCircleIcon />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-center p-3">
                      <p>When a video is added here,</p>
                      <p>It is streamed from original file location.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex-1" />
          <AddEditMediaFolder edit={isFolder} folderId={folderId} />
          <Button onClick={() => setOpen(true)}>
            <div className="flex gap-2 items-center">
              <div className="line-clamp-1">Add Media</div>
              <div className="w-4">
                <PlusIcon />
              </div>
            </div>
          </Button>
        </div>
      </div>

      <Modal title={'Select Video Files'} open={open} onClose={() => setOpen(false)}>
        <FilePicker isFolder={isFolder} onSubmit={handleFileSubmit} />
      </Modal>
    </div>
  );
};

export default ManageMediaHeader;
