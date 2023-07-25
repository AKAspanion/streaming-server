import { Router } from 'express';
import { addMedia } from './mediaController';

const router = Router();

router.post('/', addMedia);

export default router;
