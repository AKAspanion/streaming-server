import { getMediaDataDB, pushMediaDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { createVideoThumbnail, getVideoMetaData } from '@utils/ffmpeg';
import { checkIfFileExists } from '@utils/file';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import { addOneMediaSubtitle } from '@modules/subtitle/subtitleData';

export const addOneMedia = async (filePath: string, folderId?: string) => {
  try {
    const id = randomUUID();

    const metadata: MediaTypeJSONDB = await getVideoMetaData(filePath);
    const thumbnail = await createVideoThumbnail(id, filePath, metadata);

    const audioStreams: MediaStreamType[] = [];
    (metadata?.streams || []).forEach((stream: MediaStreamType) => {
      if (stream?.codec_type === 'audio') {
        audioStreams.push(stream);
      }
    });

    const selectedAudio = String(audioStreams[0]?.index || '1');

    const body: MediaTypeJSONDB = {
      ...metadata,
      id,
      folderId,
      audioStreams,
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
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem adding Video',
    });
  }
};

export const addOneSubtitleForMedia = async (mediaId: string, mediaPath: string) => {
  try {
    const parseData = path.parse(mediaPath);
    const ext = parseData.ext;
    const name = parseData.name;

    const srtFilePath = mediaPath.replace(ext, '.srt');

    const exists = await checkIfFileExists(srtFilePath);
    const stat = await fs.promises.stat(srtFilePath);

    if (exists) {
      const id = randomUUID();

      const newSub: SubtitleType = {
        id,
        name: `${name}.srt`,
        originalname: `${name}.srt`,
        filename: `${name}.srt`,
        path: srtFilePath,
        size: stat.size,
      };

      await addOneMediaSubtitle(mediaId, newSub);

      return true;
    }
  } catch (error) {
    return false;
  }
};

export const extractSubtitleForMedia = async (mediaId: string, mediaPath: string) => {
  try {
    const parseData = path.parse(mediaPath);
    const ext = parseData.ext;
    const name = parseData.name;

    const srtFilePath = mediaPath.replace(ext, '.srt');

    const exists = await checkIfFileExists(srtFilePath);
    const stat = await fs.promises.stat(srtFilePath);

    if (exists) {
      const id = randomUUID();

      const newSub: SubtitleType = {
        id,
        name: `${name}.srt`,
        originalname: `${name}.srt`,
        filename: `${name}.srt`,
        path: srtFilePath,
        size: stat.size,
      };

      await addOneMediaSubtitle(mediaId, newSub);

      return true;
    }
  } catch (error) {
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
