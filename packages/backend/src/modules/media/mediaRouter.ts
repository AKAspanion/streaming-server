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
  stopMedia,
  getSeekThumbnail,
  setSubtitleStream,
  getPoster,
} from './mediaController';
import { authenticate } from '@middleware/authenticate';

const router = Router();

router.get('/:id/poster', authenticate, getPoster);
router.get('/:id/thumbnail', getThumbnail);
router.get('/:id/thumbnail/seek', getSeekThumbnail);
router.post('/stream/:id/generate', authenticate, generateStream);
router.get('/stream/hls/*', authenticate, streamMedia);

router.post('/', authenticate, addMedia);
router.get('/probe', authenticate, probeFile);
router.get('/', authenticate, getAllMedia);
router.get('/:id', authenticate, getMedia);
router.get('/:id/play', authenticate, playMedia);
router.put('/:id/stop', authenticate, stopMedia);
router.put('/:id/status', authenticate, updatePlayStatus);
router.post('/:id/favourite', authenticate, markFavourite);
router.post('/:id/watched', authenticate, markWatched);
router.post('/:id/audio', authenticate, setAudioStream);
router.post('/:id/subtitle', authenticate, setSubtitleStream);
router.delete('/:id', authenticate, deleteMedia);

router.get('/test/stuff', authenticate, testStuff);

export default router;
