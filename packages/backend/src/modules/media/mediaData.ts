import { getMediaDataDB, pushMediaDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';

export const updateOneMedia = async (id: string, body: MediaType) => {
  const { error: pushError } = await pushMediaDB(`/${id}`, body);

  if (pushError) {
    handleJSONDBDataError(pushError, id);
  }

  return true;
};

export const getOneMediaData = async (mediaId: string) => {
  const { data, error } = await getMediaDataDB<MediaTypeJSONDB>(`/${mediaId}`);

  if (error) {
    handleJSONDBDataError(error, mediaId);
  }

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }

  return { data: { ...data, id: mediaId } };
};

export const getAllMediaData = async () => {
  const { data: result, error } = await getMediaDataDB<Record<string, MediaTypeJSONDB>>(`/`);
  if (error) {
    handleJSONDBDataError(error);
  }

  if (!result) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Video not found' });
  }

  const data: MediaType[] = (
    result
      ? Object.keys(result || {}).map((id) => ({
          ...(result[id] || {}),
          id,
        }))
      : []
  )
    .map((d) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { chapters, streams, audioStreams, ...rest } = d;
      return { ...rest };
    })
    .sort((a, b) =>
      a.originalName > b.originalName ? 1 : b.originalName > a.originalName ? -1 : 0,
    );

  return { data };
};
