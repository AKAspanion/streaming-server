import {
  useAddFolderMutation,
  useDeleteFolderMutation,
  useUpdateFolderMutation,
} from '@/services/folder';
import useToastStatus from './useToastStatus';
import { extractErrorMessage } from '@/utils/extract';
import { useCallback } from 'react';

type UseFolderMutationProps = {
  onUpdate?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
};

const useFolderMutation = (options?: UseFolderMutationProps) => {
  const { onAdd, onUpdate, onDelete } = options || {};
  const [
    processAddFolder,
    { isLoading: addFolderLoading, status: addFolderStatus, error: addFolderError },
  ] = useAddFolderMutation();
  const [
    processUpdateFolder,
    { isLoading: updateFolderLoading, status: updateFolderStatus, error: updateFolderError },
  ] = useUpdateFolderMutation();
  const [
    processDeleteFolder,
    { isLoading: deleteFolderLoading, status: deleteFolderStatus, error: deleteFolderError },
  ] = useDeleteFolderMutation();

  const addFolder = useCallback(
    async (body: AddFolderRequest) => {
      try {
        await processAddFolder(body).unwrap();

        onAdd && onAdd();
      } catch (error) {
        //
      }
    },
    [onAdd, processAddFolder],
  );

  const deleteFolder = useCallback(
    async (id: string) => {
      try {
        await processDeleteFolder(id).unwrap();

        onDelete && onDelete();
      } catch (error) {
        //
      }
    },
    [onDelete, processDeleteFolder],
  );

  const updateFolder = useCallback(
    async (body: UpdateFolderRequest) => {
      try {
        await processUpdateFolder(body).unwrap();

        onUpdate && onUpdate();
      } catch (error) {
        //
      }
    },
    [onUpdate, processUpdateFolder],
  );

  useToastStatus(updateFolderStatus, {
    successMessage: 'Folder updated successfullly',
    errorMessage: extractErrorMessage(updateFolderError, 'Failed to update Folder'),
  });

  useToastStatus(addFolderStatus, {
    successMessage: 'Folder added successfullly',
    errorMessage: extractErrorMessage(addFolderError, 'Failed to add Folder'),
  });

  return {
    addFolder,
    addFolderLoading,
    addFolderStatus,
    addFolderError,
    updateFolder,
    updateFolderLoading,
    updateFolderStatus,
    updateFolderError,
    deleteFolder,
    deleteFolderLoading,
    deleteFolderStatus,
    deleteFolderError,
  };
};

export default useFolderMutation;
