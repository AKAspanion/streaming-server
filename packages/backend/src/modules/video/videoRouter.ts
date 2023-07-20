import { Router } from 'express';
import {
  addSubtitle,
  addVideo,
  deleteVideo,
  getAllVideo,
  getSubtitle,
  getVideo,
  streamVideo,
} from './videoController';
import { uploadSubtitle, uploadVideo } from '@config/multer';

const router = Router();

router.post('/:id/subtitle', uploadSubtitle.single('sub_file'), addSubtitle);
router.get('/:id/subtitle', getSubtitle);
router.get('/', getAllVideo);
router.get('/:id', getVideo);
router.delete('/:id', deleteVideo);
router.get('/stream/:id', streamVideo);
router.post('/', uploadVideo.single('video_file'), addVideo);

export default router;
