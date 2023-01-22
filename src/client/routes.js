import { lazy } from 'react';

const Navigate = lazy(() => import('react-router-dom').then(({ Navigate: m }) => ({ default: m })));
const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));

const routes = [
  {
    path: '/',
    to: '/home',
    element: Navigate,
  },
  {
    path: '/home',
    element: Home,
  },

  {
    path: '*',
    element: NotFound,
  },
];

export default routes;
