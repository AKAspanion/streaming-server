import { Router } from 'express';
import { addMedia, getMedia, getAllMedia, getThumbnail } from './mediaController';

const router = Router();

router.get('/:mediaId/thumbnail', getThumbnail);
router.post('/', addMedia);
router.get('/', getAllMedia);
router.get('/:id', getMedia);

export default router;
