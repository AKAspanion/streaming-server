import { Router } from 'express';
import { addFolder, getAllFolder, getFolder, getMediaInFolder } from './folderController';

const router = Router();

router.post('/', addFolder);
router.get('/', getAllFolder);
router.get('/:id', getFolder);
router.get('/:id/media', getMediaInFolder);

export default router;
