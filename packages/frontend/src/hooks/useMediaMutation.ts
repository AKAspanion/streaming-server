import {
  useDeleteMediaByIdMutation,
  useMarkMediaFavouriteMutation,
  useMarkMediaWatchedMutation,
  useSetMediaAudioMutation,
  useStopMediaByIdMutation,
  useUpdateMediaStatusMutation,
} from '@services/media';
import { useCallback } from 'react';
import useToastStatus from './useToastStatus';

const useMediaMutation = (options?: { onDelete?: () => void }) => {
  const { onDelete } = options || {};
  const [processDelete, { isLoading: isDeleteLoading, status: deleteStatus, data: deleteData }] =
    useDeleteMediaByIdMutation();

  const [markMediaFavourite, { isLoading: isMarkFavouriteLoading }] =
    useMarkMediaFavouriteMutation();
  const [markMediaWatched, { isLoading: isMarkWatchedLoading }] = useMarkMediaWatchedMutation();
  const [updateMediaStatus, { isLoading: isMediaStatusUpdating }] = useUpdateMediaStatusMutation();
  const [updateAudio, { isLoading: isAudioUpdating }] = useSetMediaAudioMutation();
  const [stopMedia] = useStopMediaByIdMutation();

  const deleteMedia = useCallback(
    async (id: string) => {
      await processDelete(id).unwrap();

      onDelete && onDelete();
    },
    [onDelete, processDelete],
  );

  useToastStatus(deleteStatus, {
    successMessage: 'Media deleted successfully',
    errorMessage: 'Failed to delete media',
  });

  return {
    deleteMedia,
    deleteData,
    isDeleteLoading,
    markMediaFavourite,
    isMarkFavouriteLoading,
    markMediaWatched,
    isMarkWatchedLoading,
    updateMediaStatus,
    isMediaStatusUpdating,
    updateAudio,
    isAudioUpdating,
    stopMedia,
  };
};

export default useMediaMutation;
