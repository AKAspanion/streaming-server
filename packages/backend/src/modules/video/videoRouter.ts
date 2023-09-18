import { Router } from 'express';
import {
  addVideo,
  deleteVideo,
  getAllVideo,
  getThumbnail,
  getSeekThumbnail,
  getVideo,
  streamVideo,
} from './videoController';
import { uploadVideo } from '@config/multer';
import { authenticate } from '@middleware/authenticate';

const router = Router();

router.get('/', authenticate, getAllVideo);
router.get('/:id/thumbnail', authenticate, getThumbnail);
router.get('/:id', authenticate, getVideo);
router.delete('/:id', authenticate, deleteVideo);
router.get('/stream/:id', authenticate, streamVideo);
router.get('/:id/thumbnail/seek', authenticate, getSeekThumbnail);
router.post('/', authenticate, uploadVideo.single('video_file'), addVideo);

export default router;
