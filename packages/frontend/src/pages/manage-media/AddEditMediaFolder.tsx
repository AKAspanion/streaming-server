import Modal from '@/components/atoms/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useFolderMutation from '@/hooks/useFolderMutation';
import { useGetFolderByIdQuery } from '@/services/folder';
import { FolderPlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Select } from '@radix-ui/react-select';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AddEditMediaFolderProps {
  edit?: boolean;
  folderId?: string;
}

const AddEditMediaFolder: FC<AddEditMediaFolderProps> = ({ edit, folderId = '' }) => {
  const navigate = useNavigate();
  const { data: folderData } = useGetFolderByIdQuery(folderId);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(folderData?.data?.name || '');
  const [category, setCategory] = useState(folderData?.data?.category || 'video');
  const [description, setDescription] = useState(folderData?.data?.description || '');

  const { addFolder, deleteFolder, updateFolder } = useFolderMutation({
    onDelete: () => navigate('/manage-media'),
    onUpdate: () => setOpen(false),
    onAdd: () => setOpen(false),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (edit) {
      if (folderId) {
        await updateFolder({ id: folderId, name, category, description });
      }
    } else {
      await addFolder({ name, category, description });
    }
    clearForm();
  };

  const clearForm = () => {
    setCategory('video');
    setDescription('');
    setName('');
  };

  return (
    <div>
      <div className="flex gap-1 items-center">
        {edit && (
          <Button variant={'ghost'} onClick={() => deleteFolder(folderData?.data?.id || '')}>
            <div className="w-5 text-red-500">
              <TrashIcon />
            </div>
          </Button>
        )}
        <Button variant={'secondary'} onClick={() => setOpen(true)}>
          <div className="w-5">{edit ? <PencilIcon /> : <FolderPlusIcon />}</div>
        </Button>
      </div>
      <Modal title="Add Folder" open={open} onClose={() => setOpen(false)}>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <Input value={name} placeholder="Name" onChange={(e) => setName(e.target.value)} />
          <Input
            value={description}
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select value={category} onValueChange={(v) => setCategory(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select Category</SelectLabel>
                <SelectItem value="video">Category: Video</SelectItem>
                <SelectItem value="tv">Category: TV</SelectItem>
                <SelectItem value="movie">Category: Movie</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex justify-end mt-4">
            <Button type="submit">{edit ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddEditMediaFolder;
