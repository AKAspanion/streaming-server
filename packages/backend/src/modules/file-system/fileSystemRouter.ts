import { Router } from 'express';
import { getFilesInPath, doesFileExists } from './fileSystemController';

const router = Router();

router.post('/', getFilesInPath);
router.post('/exists', doesFileExists);

export default router;
