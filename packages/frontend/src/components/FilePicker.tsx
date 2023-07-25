import Spinner from '@components/atoms/spinner/Spinner';
import { DocumentIcon, FolderIcon } from '@heroicons/react/24/solid';
import useToastStatus from '@hooks/useToastStatus';
import { useGetFileSystemQuery } from '@services/file-system';
import { cs } from '@utils/helpers';
import { useState } from 'react';

type FilePickerProps = {
  open?: boolean;
  onClose?: () => void;
};

const FilePicker: React.FC<FilePickerProps> = () => {
  const [dir, setDir] = useState<string>('');
  const { data, status, isLoading } = useGetFileSystemQuery({ dir });

  const files = data?.data || [];

  const handleFileChange = (f: FileLocationType) => {
    if (!f.isFile) {
      setDir(f.path);
    }
  };

  useToastStatus(status, {
    errorMessage: 'Error loading directory',
  });

  return (
    <div className="w-96">
      {isLoading ? (
        <div className="h-[200px] w-full flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div
          className="flex flex-col gap-2 max-w-full"
          style={{ '--file-title-width': 'calc(100% - 100px)' } as React.CSSProperties}
        >
          {files.map((f) => (
            <div
              key={f.name}
              className="flex gap-2 items-center justify-between rounded bg-slate-300 dark:bg-slate-600 px-2 py-1 "
            >
              <div
                className={cs('flex items-center flex-1 gap-2 w-full', {
                  'cursor-pointer': !f.isFile,
                })}
                onClick={() => handleFileChange(f)}
              >
                <div className="w-4">{f.isFile ? <DocumentIcon /> : <FolderIcon />}</div>
                <div className="text-sm overflow-hidden text-ellipsis whitespace-nowrap w-[var(--file-title-width)]">
                  {f.name}
                </div>
              </div>
              <div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilePicker;
