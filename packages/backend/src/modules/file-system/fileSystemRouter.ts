import { Router } from 'express';
import { getFilesInPath } from './fileSystemController';

const router = Router();

router.post('/', getFilesInPath);

export default router;
