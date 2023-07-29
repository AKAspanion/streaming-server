import { useDeleteMediaByIdMutation } from '@services/media';
import { useCallback, useEffect } from 'react';
import useToastStatus from './useToastStatus';

const useMedia = (options?: { onDelete?: () => void }) => {
  const { onDelete } = options || {};
  const [deleteMedia, { isLoading: isDeleteLoading, status: deleteStatus, data: deleteData }] =
    useDeleteMediaByIdMutation();

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMedia(id);
    },
    [deleteMedia],
  );

  useToastStatus(deleteStatus, {
    successMessage: 'Media deleted successfully',
    errorMessage: 'Failed to delete media',
  });

  useEffect(() => {
    if (deleteStatus === 'fulfilled') {
      onDelete && onDelete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteStatus]);

  return { handleDelete, deleteData, isDeleteLoading };
};

export default useMedia;
