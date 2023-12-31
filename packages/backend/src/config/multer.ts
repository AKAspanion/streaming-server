import { WEB_VIDEO_FILES } from '@common/constants/app';
import { AppError, HttpCode } from '@utils/exceptions';
import { getResourcePath, makeDirectory } from '@utils/helper';
import multer from 'multer';

const videoPath = getResourcePath('_app_data/_videos');
const subPath = getResourcePath('_app_data/_subs');

const multerVideoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    makeDirectory(videoPath);
    cb(null, videoPath);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `video-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const multerSubsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    makeDirectory(subPath);
    cb(null, subPath);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `sub-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

export const uploadVideo = multer({
  storage: multerVideoStorage,
  fileFilter: (req, file, cb) => {
    const allowed = WEB_VIDEO_FILES.map((f) => f.replace('.', ''));
    if (allowed.includes(file.mimetype.split('/')[1])) {
      cb(null, true);
    } else {
      cb(
        new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: 'Not a web Video File!!',
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
