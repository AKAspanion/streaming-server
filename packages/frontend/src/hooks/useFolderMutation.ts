import { useAddFolderMutation } from '@/services/folder';
import useToastStatus from './useToastStatus';
import { extractErrorMessage } from '@/utils/extract';

const useFolderMutation = () => {
  const [
    addFolder,
    { isLoading: addFolderLoading, status: addFolderStatus, error: addFolderError },
  ] = useAddFolderMutation();

  useToastStatus(addFolderStatus, {
    successMessage: 'Folder added successfullly',
    errorMessage: extractErrorMessage(addFolderError, 'Failed to add Folder'),
  });

  return { addFolder, addFolderLoading, addFolderStatus, addFolderError };
};

export default useFolderMutation;
