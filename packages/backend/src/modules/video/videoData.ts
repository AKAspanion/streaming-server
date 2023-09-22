import { getVideoDataDB, pushVideoDB } from '@database/json';
import { handleJsonDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { createVideoThumbnail, getVideoMetaData } from '@utils/ffmpeg';
import logger from '@utils/logger';

export const getOneVideoData = async (videoId: string) => {
  const { data, error } = await getVideoDataDB<VideoTypeJsonDB>(`/${videoId}`);

  if (error) {
    handleJsonDBDataError(error, videoId);
  }

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Video not found' });
  }

  return { data: { ...data, id: videoId } };
};

export const getAllVideoData = async () => {
  const { data: result, error } = await getVideoDataDB<Record<string, VideoTypeJsonDB>>(`/`);
  if (error) {
    handleJsonDBDataError(error);
  }

  if (!result) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Video not found' });
  }

  const data: VideoTypeJsonDB[] = result
    ? Object.keys(result || {}).map((id) => ({
        ...(result[id] || {}),
        id,
      }))
    : [];

  return { data };
};

export const extractThumbnailForVideo = async (videoId: string, data: VideoTypeJsonDB) => {
  try {
    if (data?.thumbnail?.path) {
      return data?.thumbnail;
    } else {
      const metadata: MediaTypeJsonDB = await getVideoMetaData(data?.path);
      const thumbnail = await createVideoThumbnail(videoId, data?.path, metadata);
      const { error: pushError } = await pushVideoDB(`/${videoId}/thumbnail`, thumbnail);

      if (pushError) {
        handleJsonDBDataError(pushError, videoId);
      }
      return thumbnail;
    }
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};
