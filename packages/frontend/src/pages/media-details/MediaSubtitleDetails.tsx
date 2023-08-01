import Modal from '@/components/atoms/modal/Modal';
import Spinner from '@/components/atoms/spinner/Spinner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import useToastStatus from '@/hooks/useToastStatus';
import { useAddMediaSubtitleMutation, useDeleteMediaSubtitleMutation } from '@/services/media';
import { cs } from '@/utils/helpers';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { FC, useMemo, useRef, useState } from 'react';

interface MediaSubtitleDetailsProps {
  id: string;
  data?: SubsType;
}

const MediaSubtitleDetails: FC<MediaSubtitleDetailsProps> = ({ id, data }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const [addSubtitle, { isLoading: subLoading, status: subStatus }] = useAddMediaSubtitleMutation();
  const [deleteSubtitle, { isLoading: subDeleteLoading, status: subDeleteStatus }] =
    useDeleteMediaSubtitleMutation();

  const loading = subLoading || subDeleteLoading;

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

  const deleteFile = async () => {
    await deleteSubtitle(id);
  };

  const details = useMemo(() => {
    return [
      { name: 'Name', value: data?.name || '' },
      { name: 'Encoding', value: data?.encoding || '' },
    ];
  }, [data?.encoding, data?.name]);

  useToastStatus(subStatus, {
    successMessage: 'Subtitle added successfully',
    errorMessage: 'Failed to load subtitle',
  });

  useToastStatus(subDeleteStatus, {
    successMessage: 'Subtitle deleted successfully',
    errorMessage: 'Failed to delete subtitle',
  });

  return (
    <div>
      <Button variant={'secondary'} onClick={() => setOpen(true)}>
        <div className="flex gap-2 items-center">
          Subtitle
          <div className={cs('w-4', { 'text-green-500': !!data })}>
            <ChatBubbleBottomCenterTextIcon />
          </div>
        </div>
      </Button>
      <Modal title={'Subtitle Details'} open={open} onClose={() => setOpen(!open)}>
        <div className="w-[420px]">
          {subLoading ? (
            <div className="flex items-center justify-center">
              <Spinner />
            </div>
          ) : data ? (
            <React.Fragment>
              <div
                style={{ gridTemplateColumns: 'auto 1fr' }}
                className={
                  'p-4 px-4 bg-slate-800 rounded-md mb-4 text-sm grid grid-col-2 transition-all'
                }
              >
                {details.map(({ name, value }) => (
                  <React.Fragment key={name}>
                    <div className="whitespace-nowrap pr-4 pb-1 font-semibold">{name}</div>
                    <div title={value} className="break-all pb-1">
                      {value}
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <div className="flex gap-4 items-center justify-between">
                <div className="pb-1">Load subtitle during play</div>
                <Switch checked />
              </div>
              <div className="pt-4" />
            </React.Fragment>
          ) : (
            <div className="text-center p-6">No subtitle loaded</div>
          )}
        </div>
        <div className="flex w-full justify-between gap-4">
          <Button disabled={!data || loading} variant={'destructive'} onClick={() => deleteFile()}>
            <div className="flex gap-4 items-center">Delete</div>
          </Button>
          <Button disabled={loading} onClick={() => openFile()}>
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
