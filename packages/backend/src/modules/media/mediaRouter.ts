import { Router } from 'express';
import { addMedia, getMedia, getAllMedia, getThumbnail, streamMedia } from './mediaController';

const router = Router();

router.get('/:mediaId/thumbnail', getThumbnail);
router.get('/:mediaId/stream', streamMedia);

router.post('/', addMedia);
router.get('/', getAllMedia);
router.get('/:id', getMedia);

export default router;
