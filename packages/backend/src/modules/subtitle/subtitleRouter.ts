import { Router } from 'express';
import {
  addMediaSubtitle,
  addVideoSubtitle,
  deleteMediaSubtitle,
  getMediaSubtitle,
  getVideoSubtitle,
} from './subtitleController';
import { uploadSubtitle } from '@config/multer';

const router = Router();

router.post('/:videoId/video', uploadSubtitle.single('sub_file'), addVideoSubtitle);
router.post('/:mediaId/media', uploadSubtitle.single('sub_file'), addMediaSubtitle);
router.get('/:videoId/video', getVideoSubtitle);
router.get('/:mediaId/media', getMediaSubtitle);
router.delete('/:mediaId/media', deleteMediaSubtitle);

export default router;
