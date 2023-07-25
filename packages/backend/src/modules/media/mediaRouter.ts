import { Router } from 'express';
import { addMedia, getAllMedia, getThumbnail } from './mediaController';

const router = Router();

router.get('/:mediaId/thumbnail', getThumbnail);
router.post('/', addMedia);
router.get('/', getAllMedia);

export default router;
