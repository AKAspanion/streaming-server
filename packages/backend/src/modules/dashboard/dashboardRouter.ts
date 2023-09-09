import { Router } from 'express';
import { getFavourites, getRecentAdded, getRecentWatched } from './dashboardController';

const router = Router();

router.get('/recent', getRecentAdded);
router.get('/continue', getRecentWatched);
router.get('/favourite', getFavourites);

export default router;
