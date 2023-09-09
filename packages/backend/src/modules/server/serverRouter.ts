import { Router } from 'express';
import { quitServer } from './serverController';

const router = Router();

router.get('/quit', quitServer);

export default router;
