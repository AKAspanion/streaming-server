import { Router } from 'express';
import {
  getFavourites,
  getRecentAdded,
  getRecentCompleted,
  getRecentWatched,
} from './dashboardController';

const router = Router();

router.get('/recent', getRecentAdded);
router.get('/continue', getRecentWatched);
router.get('/completed', getRecentCompleted);
router.get('/favourite', getFavourites);

export default router;
