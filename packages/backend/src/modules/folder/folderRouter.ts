import { Router } from 'express';
import { addFolder, getAllFolder } from './folderController';

const router = Router();

router.post('/', addFolder);
router.get('/', getAllFolder);

export default router;
