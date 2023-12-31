import Modal from '@/components/atoms/modal/Modal';
import Spinner from '@/components/atoms/spinner/Spinner';
import ClosedCaptionIcon from '@/components/icons/ClosedCaptionIcon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import useToastStatus from '@/hooks/useToastStatus';
import {
  useAddMediaSubtitleMutation,
  useDeleteMediaSubtitleMutation,
  useSetMediaSubtitleMutation,
} from '@/services/media';
import { cs } from '@/utils/helpers';
import { normalizeText } from '@common/utils/validate';
import { TrashIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { FC, useRef, useState } from 'react';

interface MediaSubtitleDetailsProps {
  id: string;
  loading: boolean;
  selected?: number;
  data?: SubtitleType[];
}

const MediaSubtitleDetails: FC<MediaSubtitleDetailsProps> = ({
  id,
  data,
  loading,
  selected = 0,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const [addSubtitle, { isLoading: subLoading, status: subStatus }] = useAddMediaSubtitleMutation();
  const [deleteSubtitle, { isLoading: subDeleteLoading, status: subDeleteStatus }] =
    useDeleteMediaSubtitleMutation();
  const [updateSubtitle, { isLoading: subUpdateLoading, status: subUpdateStatus }] =
    useSetMediaSubtitleMutation();

  const allLoading = loading || subLoading || subDeleteLoading || subUpdateLoading;

  const handleSubtitleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        const file = e.target.files[0];

        const body = new FormData();
        body.append('sub_file', file);
        body.append('name', file.name);

        await addSubtitle({ id, body });
        if (ref.current) {
          ref.current.value = '';
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openFile = () => {
    const subInputDom = ref.current;
    if (subInputDom) {
      subInputDom.click();
    }
  };

  const deleteFile = async (subtitleId: string) => {
    await deleteSubtitle({ id, subtitleId });
  };

  useToastStatus(subStatus, {
    successMessage: 'Subtitle added successfully',
    errorMessage: 'Failed to load subtitle',
  });

  useToastStatus(subDeleteStatus, {
    successMessage: 'Subtitle deleted successfully',
    errorMessage: 'Failed to delete subtitle',
  });

  useToastStatus(subUpdateStatus, {
    successMessage: 'Subtitle set successfully',
    errorMessage: 'Failed to set subtitle',
  });

  return (
    <div>
      <Button variant={'secondary'} onClick={() => setOpen(true)}>
        <div className="flex gap-2 items-center">
          Subtitle
          <div className={cs('w-5', { 'text-green-500': !!data })}>
            <ClosedCaptionIcon />
          </div>
        </div>
      </Button>
      <Modal title={'Subtitles'} open={open} onClose={() => setOpen(!open)}>
        <div className="w-[420px]">
          {allLoading ? (
            <div className="flex items-center justify-center">
              <Spinner />
            </div>
          ) : data && data?.length > 0 ? (
            data.map((d, index) => (
              <React.Fragment>
                <div
                  className={
                    'p-3 dark:bg-slate-800 bg-slate-300 rounded-md mb-3 gap-2 text-sm flex justify-between items-center transition-all'
                  }
                >
                  <div title={d?.name} className="line-clamp-2 pr-4 font-semibold">
                    {normalizeText(d?.name)}
                  </div>
                  <div className="flex gap-4">
                    <div
                      className="w-4 cursor-pointer text-red-500"
                      onClick={() => deleteFile(d.id)}
                    >
                      <TrashIcon />
                    </div>
                    <Checkbox
                      checked={selected === index}
                      defaultChecked={selected === index}
                      onCheckedChange={() => updateSubtitle({ id, index })}
                    />
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <div className="text-center p-6">No subtitle loaded</div>
          )}
        </div>
        <div className="flex w-full justify-end gap-4 pt-1">
          <Button disabled={allLoading} onClick={() => openFile()}>
            <div className="flex gap-4 items-center">Add</div>
          </Button>
        </div>
        <input
          type="file"
          ref={ref}
          accept=".srt"
          className="invisible fixed pointer-events-none left-0"
          onChange={handleSubtitleLoad}
        />
      </Modal>
    </div>
  );
};

export default MediaSubtitleDetails;
