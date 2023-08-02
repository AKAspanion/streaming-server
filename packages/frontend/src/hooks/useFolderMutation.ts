import { useAddFolderMutation } from '@/services/folder';
import useToastStatus from './useToastStatus';

const useFolderMutation = () => {
  const [
    addFolder,
    { isLoading: addFolderLoading, status: addFolderStatus, error: addFolderError },
  ] = useAddFolderMutation();

  useToastStatus(addFolderStatus, {
    successMessage: 'Folder added successfullly',
    errorMessage: 'Failed to add Folder',
  });

  return { addFolder, addFolderLoading, addFolderStatus, addFolderError };
};

export default useFolderMutation;
