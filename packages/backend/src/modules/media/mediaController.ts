import { getMediaDataDB, pushMediaDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { createVideoThumbnail, readVideoMetaData } from '@utils/ffmpeg';
import { getFileType } from '@utils/file';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';

type AddMediaRequestHandler = RequestHandler<{ body: { file: FileLocationType } }>;

export const addMedia: AddMediaRequestHandler = async (req, res) => {
  const { file } = req.body;

  if (!file?.path) {
    throw new AppError({
      description: 'File path is required',
      httpCode: HttpCode.BAD_REQUEST,
    });
  }

  const { type } = getFileType(file.path);

  if (type === 'directory') {
    throw new AppError({
      description: 'File path points to a directory',
      httpCode: HttpCode.BAD_REQUEST,
    });
  }

  const metadata: MediaTypeJSONDB = await readVideoMetaData(file.path);
  const thumbnail = await createVideoThumbnail(file.path, metadata.originalName);

  const id = randomUUID();

  const body = { ...metadata, thumbnail };
  const { error } = await pushMediaDB(`/${id}`, body);

  if (error) {
    handleJSONDBDataError(error, id);
  }

  return res.status(HttpCode.OK).send({ data: 'Video added successfully' });
};

export const getAllMedia: AddMediaRequestHandler = async (req, res) => {
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
  ).map((d) => {
    return {
      id: d.id,
      format: d.format,
      parsedData: d.parsedData,
      originalName: d.originalName,
      mimeType: d.mimeType,
    };
  });

  return res.status(HttpCode.OK).send({ data });
};

export const getThumbnail: RequestHandler = async (req, res) => {
  const mediaId = req.params.mediaId || '';
  const { data, error } = await getMediaDataDB<MediaTypeJSONDB>(`/${mediaId}`);

  if (error) {
    handleJSONDBDataError(error, mediaId);
  }

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Media not found' });
  }

  if (data?.thumbnail) {
    const fileName = data?.thumbnail.name;

    res.download(data?.thumbnail?.path, fileName);
  } else {
    throw new AppError({ httpCode: HttpCode.NOT_FOUND, description: 'Thumbnail not found' });
  }
};
