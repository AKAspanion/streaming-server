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
} from './mediaController';

const router = Router();

router.get('/:mediaId/thumbnail', getThumbnail);
router.post('/stream/:mediaId/generate', generateStream);
router.get('/stream/hls/*', streamMedia);

router.post('/', addMedia);
router.get('/probe', probeFile);
router.get('/', getAllMedia);
router.get('/:id', getMedia);
router.delete('/:id', deleteMedia);

router.get('/test/stuff', testStuff);

export default router;
