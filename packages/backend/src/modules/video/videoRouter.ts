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

const router = Router();

router.get('/', getAllVideo);
router.get('/:id/thumbnail', getThumbnail);
router.get('/:id', getVideo);
router.delete('/:id', deleteVideo);
router.get('/stream/:id', streamVideo);
router.get('/:id/thumbnail/seek', getSeekThumbnail);
router.post('/', uploadVideo.single('video_file'), addVideo);

export default router;
