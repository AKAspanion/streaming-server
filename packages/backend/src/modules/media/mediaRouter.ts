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
  updatePlayStatus,
  setAudioStream,
} from './mediaController';

const router = Router();

router.get('/:id/thumbnail', getThumbnail);
router.post('/stream/:id/generate', generateStream);
router.get('/stream/hls/*', streamMedia);

router.post('/', addMedia);
router.get('/probe', probeFile);
router.get('/', getAllMedia);
router.get('/:id', getMedia);
router.get('/:id/play', playMedia);
router.put('/:id/status', updatePlayStatus);
router.post('/:id/favourite', markFavourite);
router.post('/:id/watched', markWatched);
router.post('/:id/audio', setAudioStream);
router.delete('/:id', deleteMedia);

router.get('/test/stuff', testStuff);

export default router;
