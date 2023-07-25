import { RouteObject, createHashRouter } from 'react-router-dom';
import VideoPlay from '@pages/video-play/VideoPlay';
import VideoUpload from '@pages/video-upload/VideoUpload';
import Home from '@pages/home/Home';
import { FolderIcon, HomeIcon } from '@heroicons/react/24/solid';
import Empty from '../layout/Empty';
import ManageMedia from '@pages/manage-media/ManageMedia';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
    handle: { name: 'Root', hide: true },
    children: [
      {
        path: '/',
        element: <Empty />,
        handle: { name: 'Home', icon: <HomeIcon /> },
        children: [
          {
            path: 'about',
            element: <div>About</div>,
            handle: { name: 'About', hide: true },
          },
          {
            path: 'video-upload',
            element: <VideoUpload />,
            handle: {
              name: 'Video List',
              icon: <FolderIcon />,
              crumb: [
                () => ({ to: '/', label: 'Home' }),
                () => ({ to: 'video-upload', label: 'Video List' }),
              ],
            },
          },
          {
            path: 'video-details',
            element: <div>Details</div>,
            handle: {
              hide: true,
              name: 'Video Details',
              crumb: [
                () => ({ to: '/', label: 'Home' }),
                () => ({ to: 'video-upload', label: 'Video List' }),
                () => ({ to: 'video-details', label: 'Video Details' }),
              ],
            },
          },
        ],
      },
      {
        path: 'video-play/:videoId',
        element: <VideoPlay />,
        handle: {
          hide: true,
          name: 'Video Play',
        },
      },
      {
        path: '/manage-media',
        element: <Empty />,
        handle: {
          name: 'Manage Media',
          icon: <FolderIcon />,
          crumb: [() => ({ to: '/manage-media', label: 'Manage Media' })],
        },
        children: [
          {
            path: '',
            element: <ManageMedia />,
            handle: {
              hide: true,
              name: 'Media List',
              crumb: [() => ({ to: 'manage-media', label: 'Media List' })],
            },
          },
          {
            path: ':mediaId/details',
            element: <ManageMedia />,
            handle: {
              hide: true,
              name: 'Video Watch',
              crumb: [() => ({ to: 'manage-media', label: 'Manage Media' })],
            },
          },
        ],
      },
    ],
  },
];

export const router = createHashRouter(routes);
