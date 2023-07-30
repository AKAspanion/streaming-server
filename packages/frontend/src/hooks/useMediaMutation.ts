import {
  useDeleteMediaByIdMutation,
  useMarkMediaFavouriteMutation,
  useMarkMediaWatchedMutation,
  useUpdateMediaStatusMutation,
} from '@services/media';
import { useCallback, useEffect } from 'react';
import useToastStatus from './useToastStatus';

const useMediaMutation = (options?: { onDelete?: () => void }) => {
  const { onDelete } = options || {};
  const [deleteMedia, { isLoading: isDeleteLoading, status: deleteStatus, data: deleteData }] =
    useDeleteMediaByIdMutation();

  const [markMediaFavourite, { isLoading: isMarkFavouriteLoading }] =
    useMarkMediaFavouriteMutation();
  const [markMediaWatched, { isLoading: isMarkWatchedLoading }] = useMarkMediaWatchedMutation();
  const [updateMediaStatus, { isLoading: isMediaStatusUpdating }] = useUpdateMediaStatusMutation();

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

  return {
    handleDelete,
    deleteData,
    isDeleteLoading,
    markMediaFavourite,
    isMarkFavouriteLoading,
    markMediaWatched,
    isMarkWatchedLoading,
    updateMediaStatus,
    isMediaStatusUpdating,
  };
};

export default useMediaMutation;
