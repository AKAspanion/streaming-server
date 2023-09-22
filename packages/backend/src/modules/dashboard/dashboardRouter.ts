import { Router } from 'express';
import {
  getFavorites,
  getRecentAdded,
  getRecentCompleted,
  getRecentWatched,
} from './dashboardController';
import { authenticate } from '@middleware/authenticate';

const router = Router();

router.get('/recent', authenticate, getRecentAdded);
router.get('/continue', authenticate, getRecentWatched);
router.get('/completed', authenticate, getRecentCompleted);
router.get('/favorite', authenticate, getFavorites);

export default router;
