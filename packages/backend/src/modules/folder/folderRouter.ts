import { Router } from 'express';
import {
  addFolder,
  deleteFolder,
  getAllFolder,
  getFolder,
  getMediaInFolder,
  updateFolder,
} from './folderController';
import { authenticate } from '@middleware/authenticate';

const router = Router();

router.post('/', authenticate, addFolder);
router.get('/', authenticate, getAllFolder);
router.get('/:id', authenticate, getFolder);
router.put('/:id', authenticate, updateFolder);
router.delete('/:id', authenticate, deleteFolder);
router.get('/:id/media', authenticate, getMediaInFolder);

export default router;
