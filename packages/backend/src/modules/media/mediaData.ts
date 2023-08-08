import { getMediaDataDB, pushMediaDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import {
  createPoster,
  createSubtitle,
  createVideoThumbnail,
  getVideoMetaData,
} from '@utils/ffmpeg';
import { checkIfFileExists } from '@utils/file';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import { addOneMediaSubtitle } from '@modules/subtitle/subtitleData';
import logger from '@utils/logger';

export const addOneMedia = async (filePath: string, folderId?: string) => {
  try {
    const id = randomUUID();

    const metadata: MediaTypeJSONDB = await getVideoMetaData(filePath);
    const thumbnail = await createVideoThumbnail(id, filePath, metadata);

    const audioStreams: MediaStreamType[] = [];
    const subtitleStreams: MediaStreamType[] = [];
    (metadata?.streams || []).forEach((stream: MediaStreamType) => {
      if (stream?.codec_type === 'audio') {
        audioStreams.push(stream);
      }

      if (stream?.codec_type === 'subtitle') {
        subtitleStreams.push(stream);
      }
    });

    const selectedAudio = String(audioStreams[0]?.index || '1');

    const body: MediaTypeJSONDB = {
      ...metadata,
      id,
      folderId,
      audioStreams,
      subtitleStreams,
      thumbnail,
      selectedAudio,
      path: filePath,
      addDate: new Date().getTime(),
    };

    const { error } = await pushMediaDB(`/${id}`, body);

    if (error) {
      handleJSONDBDataError(error, id);
    }

    return { data: body };
  } catch (error) {
    logger.error(error);
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem adding Media',
    });
  }
};

export const extractPosterForMedia = async (mediaId: string, mediaPath: string) => {
  try {
    const { posterPath } = await createPoster(mediaId, mediaPath);
    if (posterPath) {
      const { error: pushError } = await pushMediaDB(`/${mediaId}/poster`, { path: posterPath });

      if (pushError) {
        handleJSONDBDataError(pushError, mediaId);
      }
    }

    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

export const addFileSubtitleForMedia = async (mediaId: string, mediaPath: string) => {
  try {
    const parseData = path.parse(mediaPath);
    const ext = parseData.ext;
    const name = parseData.name;

    const srtFilePath = mediaPath.replace(ext, '.srt');

    await addOneSubtitleOfMedia(mediaId, name, srtFilePath);
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

const addOneSubtitleOfMedia = async (
  mediaId: string,
  name: string,
  srtFilePath: string,
  copied = false,
) => {
  try {
    const exists = await checkIfFileExists(srtFilePath);
    const stat = await fs.promises.stat(srtFilePath);

    if (exists) {
      const id = randomUUID();

      const newSub: SubtitleType = {
        id,
        name: `${name}`,
        originalname: `${name}`,
        filename: `${name}.srt`,
        path: srtFilePath,
        size: stat.size,
        copied,
      };

      await addOneMediaSubtitle(mediaId, newSub);

      return true;
    } else {
      return true;
    }
  } catch (error) {
    logger.error(error);
    return false;
  }
};

export const extractSubtitleForMedia = async (
  mediaId: string,
  mediaPath: string,
  subtitleStreams: MediaStreamType[],
) => {
  try {
    const addPromises: Promise<boolean>[] = [];
    const streamsLength = subtitleStreams.length;
    for (let i = 0; i < streamsLength; i++) {
      const { subPath, name, error } = await createSubtitle(mediaId, mediaPath, i);
      if (!error) {
        const stream = subtitleStreams[i];
        const subName = stream?.tags?.title || name;
        addPromises.push(addOneSubtitleOfMedia(mediaId, subName, subPath, true));
      }
    }

    await Promise.all(addPromises);
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

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
