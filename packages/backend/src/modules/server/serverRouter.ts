import { Router } from 'express';
import { networkIp, quitServer } from './serverController';

const router = Router();

router.get('/quit', quitServer);
router.get('/network-ip', networkIp);

export default router;
