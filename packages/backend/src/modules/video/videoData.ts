import { getVideoDataDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';

export const getOneVideoData = async (videoId: string) => {
  const { data, error } = await getVideoDataDB<VideoTypeJSONDB>(`/${videoId}`);

  if (error) {
    handleJSONDBDataError(error, videoId);
  }

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Video not found' });
  }

  return { data: { ...data, id: videoId } };
};

export const getAllVideoData = async () => {
  const { data: result, error } = await getVideoDataDB<Record<string, VideoTypeJSONDB>>(`/`);
  if (error) {
    handleJSONDBDataError(error);
  }

  if (!result) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Video not found' });
  }

  const data: VideoTypeJSONDB[] = result
    ? Object.keys(result || {}).map((id) => ({
        ...(result[id] || {}),
        id,
      }))
    : [];

  return { data };
};
