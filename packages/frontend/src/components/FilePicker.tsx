import Spinner from '@components/atoms/spinner/Spinner';
import { DocumentIcon, FolderIcon } from '@heroicons/react/24/solid';
import useToastStatus from '@hooks/useToastStatus';
import { useGetFileSystemQuery } from '@services/file-system';
import { cs } from '@utils/helpers';
import { useMemo, useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';

type FilePickerProps = {
  isFolder?: boolean;
  onSubmit?: (files: FileLocationType[]) => void;
};

const FilePicker: React.FC<FilePickerProps> = (props) => {
  const { isFolder, onSubmit } = props;
  const [dir, setDir] = useState<string>('');
  const { data, status, isFetching } = useGetFileSystemQuery({ dir });

  const [selectedFiles, setSelectedFiles] = useState<Record<string, boolean>>({});

  const locations = data?.data || [];
  const files = useMemo(() => {
    const filtered = (data?.data || []).filter((l) => l?.name !== '...');
    if (isFolder) {
      return filtered.filter((l) => l?.isFile);
    } else {
      return filtered;
    }
  }, [isFolder, data?.data]);

  const handleFileChange = (f: FileLocationType) => {
    if (!f.isFile) {
      setDir(f.path);
    }
  };

  const handleFileSelect = (v: boolean | 'indeterminate', f: FileLocationType) => {
    setSelectedFiles((d) => ({ ...d, [f.path]: !!v }));
  };

  const handleClear = () => {
    setSelectedFiles((s) => {
      const newS: Record<string, boolean> = {};
      Object.keys(s).forEach((k: string) => {
        newS[k] = false;
      });

      return newS;
    });
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const submitFiles = files.filter((f) => {
        return selectedFiles[f.path] === true;
      });

      onSubmit(submitFiles);
    }
  };

  const isFileSelected = useMemo(() => {
    return Object.values(selectedFiles).filter(Boolean).length !== 0;
  }, [selectedFiles]);

  const selectAllFiles = (v: boolean) => {
    const newS: Record<string, boolean> = {};
    files.forEach((f) => {
      newS[f.path] = v;
    });
    setSelectedFiles((s) => ({ ...s, ...newS }));
  };

  const isAllSelected = useMemo(() => {
    let count = 0;
    const fileLength = files.length;
    for (let i = 0; i < fileLength; i++) {
      const f = files[i];
      if (selectedFiles[f.path]) {
        count++;
      }
    }

    return count === 0 ? false : count === fileLength ? true : 'indeterminate';
  }, [files, selectedFiles]);

  useToastStatus(status, {
    errorMessage: 'Error loading directory',
  });

  return (
    <div style={{ width: 420 }}>
      <div
        className={cs('overflow-y-auto', {
          'max-h-[336px]': isFileSelected,
          'max-h-96': !isFileSelected,
        })}
      >
        {isFetching ? (
          <div className="h-full w-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div
            className="flex flex-col gap-2 max-w-full"
            style={{ '--file-title-width': 'calc(100% - 32px)' } as React.CSSProperties}
          >
            <div className="flex justify-between pr-2">
              <div>Select All</div>
              <Checkbox
                disabled={files.length === 0}
                checked={isAllSelected}
                defaultChecked={isAllSelected}
                onCheckedChange={selectAllFiles}
              />
            </div>
            {locations.map((l) => {
              const fileName = l.isFile ? `${l.name}${l.ext}` : l.name;
              return (
                <div
                  key={l.path}
                  className={cs(
                    'flex gap-2 items-center justify-between rounded px-2 py-1 bg-slate-300 dark:bg-slate-600',
                    'hover:bg-slate-200 dark:hover:bg-slate-500',
                  )}
                >
                  <div
                    className={cs(
                      'flex items-center flex-1 gap-2 w-[var(--file-title-width)] cursor-pointer',
                    )}
                    onClick={() => handleFileChange(l)}
                  >
                    <div className="w-4">{l.isFile ? <DocumentIcon /> : <FolderIcon />}</div>
                    <div
                      title={fileName}
                      className="text-sm overflow-hidden text-ellipsis whitespace-nowrap w-[var(--file-title-width)]"
                    >
                      {fileName}
                    </div>
                  </div>
                  <div>
                    {isFolder ? (
                      l.isFile ? (
                        <Checkbox
                          checked={selectedFiles[l.path]}
                          onCheckedChange={(v) => handleFileSelect(v, l)}
                        />
                      ) : null
                    ) : l?.name !== '...' ? (
                      <Checkbox
                        checked={selectedFiles[l.path]}
                        onCheckedChange={(v) => handleFileSelect(v, l)}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {isFileSelected && (
        <div className="flex w-full justify-between gap-3 pt-3">
          <Button variant="secondary" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="secondary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilePicker;
