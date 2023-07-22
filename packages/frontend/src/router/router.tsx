import { createHashRouter } from 'react-router-dom';
import VideoPlay from '@pages/video-play/VideoPlay';
import VideoUpload from '@pages/video-upload/VideoUpload';
import Home from '@pages/home/Home';

export const router = createHashRouter([
  {
    path: '/',
    element: <Home />,
    children: [
      {
        path: 'about',
        element: <div>About</div>,
      },
      {
        path: 'video-play/:videoId',
        element: <VideoPlay />,
      },
      {
        path: 'video-upload',
        element: <VideoUpload />,
      },
    ],
  },
]);
