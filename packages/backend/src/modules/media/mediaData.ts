import { deleteMediaDB, getMediaDataDB, pushMediaDB } from '@database/json';
import { handleJsonDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import {
  createPoster,
  createSubtitle,
  createVideoThumbnail,
  getVideoMetaData,
} from '@utils/ffmpeg';
import { getFileType } from '@utils/file';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import { addOneMediaSubtitle } from '@modules/subtitle/subtitleData';
import logger from '@utils/logger';
import { deleteDirectory, deleteFilesSilently, fileExists, getResourcePath } from '@utils/helper';
import { addOneFolder } from '@modules/folder/folderData';
import { ALLOWED_VIDEO_FILES, VIDEO_RESOLUTIONS } from '@common/constants/app';

export const addOneMedia = async (filePath: string, folderId?: string) => {
  try {
    const id = randomUUID();

    const metadata: MediaTypeJsonDB = await getVideoMetaData(filePath);

    let maxHeight = 720;
    const audioStreams: MediaStreamType[] = [];
    const videoStreams: MediaStreamType[] = [];
    const subtitleStreams: MediaStreamType[] = [];
    (metadata?.streams || []).forEach((stream: MediaStreamType) => {
      if (stream?.codec_type === 'audio') {
        audioStreams.push(stream);
      }

      if (stream?.codec_type === 'subtitle') {
        subtitleStreams.push(stream);
      }

      if (stream?.codec_type === 'video') {
        videoStreams.push(stream);
        if (stream.index == 0) {
          maxHeight = stream?.height || 720;
        }
      }
    });

    const selectedAudio = String(audioStreams[0]?.index || '1');

    const body: MediaTypeJsonDB = {
      ...metadata,
      id,
      folderId,
      audioStreams,
      videoStreams,
      subtitleStreams,
      selectedAudio,
      path: filePath,
      addDate: new Date().getTime(),
      selectedResolution: 'original',
      resolutions: [
        ...VIDEO_RESOLUTIONS,
        { name: `Original(${maxHeight}p)`, id: 'original', value: maxHeight },
      ],
    };

    const { error } = await pushMediaDB(`/${id}`, body);

    if (error) {
      handleJsonDBDataError(error, id);
    }

    Promise.allSettled([
      addFileSubtitleForMedia(id, filePath),
      extractSubtitleForMedia(id, filePath, subtitleStreams),
    ]);

    return { data: body };
  } catch (error) {
    logger.error(error);
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem adding Media',
    });
  }
};

export const addMediaWithFolder = async (filePath: string, folderName: string) => {
  try {
    const folderId = randomUUID();

    await addOneFolder(folderId, {
      id: folderId,
      name: folderName,
      category: 'video',
      description: filePath,
    });

    const files: FileLocationType[] = [];
    fs.readdirSync(path.resolve(filePath)).forEach((filename) => {
      try {
        const ext = path.parse(filename).ext;
        const name = path.parse(filename).name;
        const filepath = path.join(filePath, filename);
        const { type, isFile } = getFileType(filepath);

        if (isFile && ALLOWED_VIDEO_FILES.includes(ext)) {
          files.push({ path: filepath, name, ext, type, isFile });
        }
      } catch (error) {
        logger.error('STAT' + error);
      }
    });

    await Promise.allSettled(files.map((d) => addOneMedia(d?.path, folderId)));

    return { data: { message: 'Media added successfully with folder' } };
  } catch (error) {
    logger.error(error);
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: 'Problem adding Media',
    });
  }
};

export const extractPosterForMedia = async (mediaId: string, data: MediaTypeJsonDB) => {
  try {
    if (data?.poster) {
      return data?.poster;
    } else {
      const { posterPath } = await createPoster(mediaId, data?.path);
      if (posterPath) {
        const { error: pushError } = await pushMediaDB(`/${mediaId}/poster`, { path: posterPath });

        if (pushError) {
          handleJsonDBDataError(pushError, mediaId);
        }
      }
      return { path: posterPath };
    }
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const extractThumbnailForMedia = async (mediaId: string, data: MediaTypeJsonDB) => {
  try {
    if (data?.thumbnail?.path) {
      return data?.thumbnail;
    } else {
      const thumbnail = await createVideoThumbnail(mediaId, data?.path, data);
      const { error: pushError } = await pushMediaDB(`/${mediaId}/thumbnail`, thumbnail);

      if (pushError) {
        handleJsonDBDataError(pushError, mediaId);
      }
      return thumbnail;
    }
  } catch (error) {
    logger.error(error);
    return undefined;
  }
};

export const addFileSubtitleForMedia = async (mediaId: string, mediaPath: string) => {
  try {
    const parseData = path.parse(mediaPath);
    const ext = parseData.ext;
    const name = parseData.name;

    const srtFilePath = mediaPath.replace(ext, '.srt');

    addOneSubtitleOfMedia(mediaId, name, srtFilePath);
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
    const exists = fileExists(srtFilePath);
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

    Promise.allSettled(addPromises);
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

export const updateOneMedia = async (id: string, body: MediaType) => {
  const { error: pushError } = await pushMediaDB(`/${id}`, body);

  if (pushError) {
    handleJsonDBDataError(pushError, id);
  }

  return true;
};

export const getOneMediaData = async (mediaId: string) => {
  const { data, error } = await getMediaDataDB<MediaTypeJsonDB>(`/${mediaId}`);

  if (error) {
    handleJsonDBDataError(error, mediaId);
  }

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }

  if (!fileExists(data.path)) {
    data.fileNotFound = true;
  }

  return { data: { ...data, id: mediaId } as MediaTypeJsonDB };
};

export const getAllMediaData = async () => {
  const { data: result, error } = await getMediaDataDB<Record<string, MediaTypeJsonDB>>(`/`);
  if (error) {
    handleJsonDBDataError(error);
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

export const deleteMediaData = async (media: MediaType) => {
  const filesToDelete = [media?.poster?.path, media?.thumbnail?.path];

  (media?.subs || []).forEach((s) => {
    if (s.copied) {
      filesToDelete.push(s.path);
    }
  });

  const pathToImages = getResourcePath(`_app_data/_images/${media.id}`);
  const pathToSubs = getResourcePath(`_app_data/_subs/${media.id}`);
  deleteDirectory(pathToImages);
  deleteDirectory(pathToSubs);

  deleteFilesSilently(filesToDelete);

  const { error: deleteError } = await deleteMediaDB(`/${media.id}`);

  if (deleteError) {
    handleJsonDBDataError(deleteError, media.id);
  }

  return true;
};
