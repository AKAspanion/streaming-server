import { Router } from 'express';
import { addVideo, deleteVideo, getAllVideo, getVideo, streamVideo } from './videoController';
import { uploadVideo } from '@config/multer';

const router = Router();

router.get('/', getAllVideo);
router.get('/:id', getVideo);
router.delete('/:id', deleteVideo);
router.get('/stream/:id', streamVideo);
router.post('/', uploadVideo.single('video_file'), addVideo);

export default router;
