import { Router } from 'express';
import {
  addMedia,
  getMedia,
  getAllMedia,
  getThumbnail,
  streamMedia,
  generateStream,
  probeFile,
  testStuff,
  deleteMedia,
  playMedia,
  markFavourite,
  markWatched,
} from './mediaController';

const router = Router();

router.get('/:mediaId/thumbnail', getThumbnail);
router.post('/stream/:mediaId/generate', generateStream);
router.get('/stream/hls/*', streamMedia);

router.post('/', addMedia);
router.get('/probe', probeFile);
router.get('/', getAllMedia);
router.get('/:id', getMedia);
router.get('/:id/play', playMedia);
router.post('/:id/favourite', markFavourite);
router.post('/:id/watched', markWatched);
router.delete('/:id', deleteMedia);

router.get('/test/stuff', testStuff);

export default router;
