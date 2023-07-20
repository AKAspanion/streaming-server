import { AppError, HttpCode } from '@utils/exceptions';
import multer from 'multer';
import path from 'path';

const multerVideoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../_videos'));
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `video-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const multerSubsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../_subs'));
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `sub-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

export const uploadVideo = multer({
  storage: multerVideoStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['mp4', 'mkv'];
    if (allowed.includes(file.mimetype.split('/')[1])) {
      cb(null, true);
    } else {
      cb(
        new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: 'Not a Video File!!',
        }),
      );
    }
  },
});

export const uploadSubtitle = multer({
  storage: multerSubsStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['octet-stream'];
    if (allowed.includes(file.mimetype.split('/')[1])) {
      cb(null, true);
    } else {
      cb(
        new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: 'Not a subtitle File!!',
        }),
      );
    }
  },
});
