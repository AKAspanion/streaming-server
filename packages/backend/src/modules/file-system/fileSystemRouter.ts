import { Router } from 'express';
import { getFilesInPath, doesFileExists } from './fileSystemController';
import { authenticate } from '@middleware/authenticate';

const router = Router();

router.post('/', authenticate, getFilesInPath);
router.post('/exists', authenticate, doesFileExists);

export default router;
