/* eslint-disable @typescript-eslint/no-explicit-any */
import { pushMediaDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';
import { createVideoThumbnail, readVideoMetaData } from '@utils/ffmpeg';
import { getFileType } from '@utils/file';
import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';

export const addMedia: RequestHandler = async (req, res) => {
  const { file } = req.body;

  const { type } = getFileType(file);

  if (type === 'directory') {
    throw new AppError({
      description: 'File path points to a directory',
      httpCode: HttpCode.BAD_REQUEST,
    });
  }

  const metadata: MediaTypeJSONDB = await readVideoMetaData(file);
  const thumbnail = await createVideoThumbnail(file, metadata.originalName);

  const id = randomUUID();

  const body = { ...metadata, thumbnail };
  const { error } = await pushMediaDB(`/${id}`, body);

  if (error) {
    handleJSONDBDataError(error, id);
  }

  return res.status(HttpCode.OK).send({ data: 'Video added successfully' });
};

// const createThumbnailForVideo = async (pathToFile: string) => {
//   const ffmpeg = getffmpeg();
//   const pathToSnapshot = path.join(__dirname, 'tempfiles');

//   const metadata = await readVideoMetaData(pathToFile);
// };
