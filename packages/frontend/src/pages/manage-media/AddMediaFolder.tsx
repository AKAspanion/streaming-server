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
import { FolderPlusIcon } from '@heroicons/react/24/solid';
import { Select } from '@radix-ui/react-select';
import { FC, useEffect, useState } from 'react';

interface AddMediaFolderProps {}

const AddMediaFolder: FC<AddMediaFolderProps> = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('video');
  const [description, setDescription] = useState('');

  const { addFolder, addFolderStatus } = useFolderMutation();

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await addFolder({ name, category, description });
    clearForm();
  };

  const clearForm = () => {
    setCategory('video');
    setDescription('');
    setName('');
  };

  useEffect(() => {
    if (addFolderStatus === 'fulfilled') {
      setOpen(false);
    }
  }, [addFolderStatus]);

  return (
    <div>
      <Button variant={'secondary'} onClick={() => setOpen(true)}>
        <div className="w-6">
          <FolderPlusIcon />
        </div>
      </Button>
      <Modal title="Add Folder" open={open} onClose={() => setOpen(false)}>
        <form className="flex flex-col gap-3" onSubmit={handleAdd}>
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
            <Button type="submit">Add</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddMediaFolder;
