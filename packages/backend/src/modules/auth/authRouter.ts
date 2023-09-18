import { Router } from 'express';
import { generateToken, verifyToken } from './authController';

const router = Router();

router.post('/token/generate', generateToken);
router.post('/token/verify', verifyToken);

export default router;
