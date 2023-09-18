import { Router } from 'express';
import {
  addMediaSubtitle,
  addVideoSubtitle,
  deleteMediaSubtitle,
  getMediaSubtitle,
  getVideoSubtitle,
} from './subtitleController';
import { uploadSubtitle } from '@config/multer';
import { authenticate } from '@middleware/authenticate';

const router = Router();

router.post('/:videoId/video', authenticate, uploadSubtitle.single('sub_file'), addVideoSubtitle);
router.post('/:mediaId/media', authenticate, uploadSubtitle.single('sub_file'), addMediaSubtitle);
router.get('/:videoId/video', authenticate, getVideoSubtitle);
router.get('/:mediaId/media', authenticate, getMediaSubtitle);
router.delete('/:mediaId/media', authenticate, deleteMediaSubtitle);

export default router;
