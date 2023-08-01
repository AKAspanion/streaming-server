import { Params, RouteObject, createHashRouter } from 'react-router-dom';
import VideoPlay from '@pages/video-play/VideoPlay';
import VideoUpload from '@pages/video-upload/VideoUpload';
import HomeLayout from '@layout/home/HomeLayout';
import {
  FilmIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/solid';
import EmptyLayout from '@layout/empty/EmptyLayout';
import ManageMedia from '@pages/manage-media/ManageMedia';
import MediaDetails from '@pages/media-details/MediaDetails';
import Home from '@pages/home/Home';
import MediaPlay from '@pages/media-play/MediaPlay';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomeLayout />, // Home Layout
    handle: { name: 'Root', hide: true },
    children: [
      {
        index: true,
        element: <Home />, // Home
        handle: {
          name: 'Home',
          icon: <HomeIcon />,
          handle: {
            crumb: [() => ({ to: '/', label: 'Home' })],
          },
        },
      },
      {
        path: '/video-upload',
        element: <EmptyLayout />,
        handle: {
          name: 'Video',
          icon: <VideoCameraIcon />,
          crumb: [() => ({ to: '/video-upload', label: 'Video Upload' })],
        },
        children: [
          {
            index: true,
            element: <VideoUpload />,
            handle: {
              hide: true,
              name: 'Video List',
              crumb: [() => ({ to: '/video-upload', label: 'Video List' })],
            },
          },
        ],
      },

      {
        path: '/media-search',
        element: <EmptyLayout />,
        handle: {
          hide: true,
          name: 'Search Media',
          icon: <MagnifyingGlassIcon />,
        },
        children: [
          {
            index: true,
            element: <div className="p-3">Search</div>,
            handle: {
              hide: true,
              crumb: [() => ({ to: '/media-search', label: 'Search Media' })],
            },
          },
        ],
      },
      {
        path: '/video-play/:videoId',
        element: <VideoPlay />,
        handle: {
          hide: true,
          name: 'Video Play',
        },
      },
      {
        path: '/media-play/:mediaId',
        element: <MediaPlay />,
        handle: {
          hide: true,
          name: 'Media Play',
        },
      },
      {
        path: '/manage-media',
        element: <EmptyLayout />,
        handle: {
          name: 'Media',
          icon: <FilmIcon />,
          crumb: [() => ({ to: '/manage-media', label: 'Manage Media' })],
        },
        children: [
          {
            index: true,
            element: <ManageMedia />,
            handle: {
              hide: true,
              name: 'Media List',
              crumb: [() => ({ to: '/manage-media', label: 'Media List' })],
            },
          },
          {
            path: '/manage-media/:mediaId',
            element: <MediaDetails />,
            loader: ({ params }) => params,
            handle: {
              hide: true,
              name: 'Media Details',
              crumb: [
                () => ({ to: '/manage-media', label: 'Media List' }),
                (p: Params<string>) => ({
                  to: `/manage-media/${p.mediaId}`,
                  label: 'Media Details',
                }),
              ],
            },
          },
        ],
      },
    ],
  },
];

export const router = createHashRouter(routes);
