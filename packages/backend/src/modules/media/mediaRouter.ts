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
  markFavorite,
  markWatched,
  updatePlayStatus,
  setAudioStream,
  stopMedia,
  getSeekThumbnail,
  setSubtitleStream,
  getPoster,
  setResolution,
} from './mediaController';
import { authenticate } from '@middleware/authenticate';

const router = Router();

router.get('/:id/poster', authenticate, getPoster);
router.get('/:id/thumbnail', authenticate, getThumbnail);
router.get('/:id/thumbnail/seek', authenticate, getSeekThumbnail);
router.post('/stream/:id/generate', authenticate, generateStream);
router.get('/stream/hls/*', authenticate, streamMedia);

router.post('/', authenticate, addMedia);
router.get('/probe', authenticate, probeFile);
router.get('/', authenticate, getAllMedia);
router.get('/:id', authenticate, getMedia);
router.get('/:id/play', authenticate, playMedia);
router.put('/:id/stop', authenticate, stopMedia);
router.put('/:id/status', authenticate, updatePlayStatus);
router.post('/:id/favorite', authenticate, markFavorite);
router.post('/:id/watched', authenticate, markWatched);
router.post('/:id/audio', authenticate, setAudioStream);
router.post('/:id/subtitle', authenticate, setSubtitleStream);
router.post('/:id/resolution', authenticate, setResolution);
router.delete('/:id', authenticate, deleteMedia);

router.get('/test/stuff', authenticate, testStuff);

export default router;
