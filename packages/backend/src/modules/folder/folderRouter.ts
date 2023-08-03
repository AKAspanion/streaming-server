import { Router } from 'express';
import {
  addFolder,
  deleteFolder,
  getAllFolder,
  getFolder,
  getMediaInFolder,
  updateFolder,
} from './folderController';

const router = Router();

router.post('/', addFolder);
router.get('/', getAllFolder);
router.get('/:id', getFolder);
router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);
router.get('/:id/media', getMediaInFolder);

export default router;
